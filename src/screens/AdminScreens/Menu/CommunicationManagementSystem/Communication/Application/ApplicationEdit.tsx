import { Keyboard, Linking, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import moment from 'moment';
import { useCommunicationUpdateApplicationMutation } from '../../../../../../injectEndpoints/communicationManagementEndpoints';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  statusList: [],
  selectedStatus: {},
  remarks: '',
  file: {},
};

const ApplicationEdit = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [updateApplicationApi] = useCommunicationUpdateApplicationMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Update Application Data');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getStatusList();
  }, []);

  const schema = Yup.object().shape({
    selectedStatus: Yup.object({
      id: Yup.string().required('Status is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      updateFeedbackTopic();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const updateFeedbackTopic = () => {
    setLoader(true);

    const formData = new FormData();
    formData.append('id', item.id);
    formData.append('applicationStatus', form.selectedStatus.id);
    formData.append(
      'remarks',
      isNullUndefined(form.remarks) ? null : form.remarks,
    );

    formData.append('file', {
      uri: form.file.uri,
      name: form.file.fileName || 'thumbnail.jpg',
      type: form.file.type || 'image/jpeg',
    });

    updateApplicationApi(formData)
      .unwrap()
      .then((res: any) => {
        navigation.goBack();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong,
        });
        setLoader(false);
      });
  };

  const getStatusList = () => {
    setLoader(true);

    const params = {
      listType: 'communication_application_status',
      replacements: [],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        const statusList = res.data || [];

        let selectedStatus = {};

        if (item?.applicationStatus) {
          selectedStatus =
            statusList.find(
              (st: any) =>
                st.name === item.applicationStatus ||
                st.value === item.applicationStatus,
            ) || {};
        }

        setForm((prev: any) => ({
          ...prev,
          statusList,
          selectedStatus,
        }));

        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.flex1}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <ViewAtom style={{ width: '100%', paddingHorizontal: vw(16) }}>
          <ReadOnlyRow
            label="Bipard Location"
            value={tenantId === 1 ? 'Gaya' : 'Patna'}
          />

          <ReadOnlyRow label="Training Name" value={item?.trainingName} />

          <ReadOnlyRow label="Category Name" value={item?.category} />

          <ReadOnlyRow label="Title" value={item?.title} />

          <ReadOnlyRow
            label="Date From"
            value={moment(item.dateFrom).format('DD-MM-YYYY')}
          />

          <ReadOnlyRow
            label="Date To"
            value={moment(item.dateTo).format('DD-MM-YYYY')}
          />

          <ReadOnlyRow label="Description" value={item?.description} />

          {item?.uploadedFile && (
            <TouchableAtom
              onPress={() => {
                Linking.openURL(item.userUploadedFile);
              }}
              style={styles.uploadBtn}
            >
              <TextAtom style={styles.uploadText}>View Uploaded File</TextAtom>
            </TouchableAtom>
          )}
        </ViewAtom>

        <DropDownOrganism
          label={'Status'}
          placeholder={'Status'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Status',
              Data: form.statusList,
              selectedData: form.selectedStatus,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedStatus: data,
                }));
                setErrors({ ...errors, 'selectedStatus.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedStatus?.name}
          isMandatory
          errorMessage={errors['selectedStatus.id']}
        />

        <TextInputOrganisms
          label={'Remarks'}
          placeholder={'Remarks'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.remarks}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('remarks', val);
          }}
        />

        <ImageUploadOrganism
          label={''}
          buttonText={strings.choose_file}
          onSelectImage={(file: any) => {
            setForm((prev: any) => ({
              ...prev,
              file: file,
            }));
          }}
          defaultImage={form.file?.uri}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={strings.hostelManagement.addBedDetails.update}
      />
    </SafeAreaView>
  );
};

export default ApplicationEdit;

const ReadOnlyRow = ({ label, value }: any) => {
  if (!value) return null;

  return (
    <ViewAtom style={{ marginBottom: vh(10) }}>
      <TextAtom style={styles.labelStyle}>{label}</TextAtom>
      <TextAtom
        numberOfLines={0}
        style={{
          fontFamily: fonts.Roboto_Regular,
          fontSize: vw(14),
          color: colors.grey,
        }}
      >
        {value}
      </TextAtom>
    </ViewAtom>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
  },
  contentScroll: {
    paddingBottom: vh(10),
  },
  uploadBtn: {
    borderWidth: 1,
    paddingVertical: vh(10),
    paddingHorizontal: vw(15),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    width: vw(320),
    alignSelf: 'center',
    backgroundColor: colors.backgroundColor,
    marginBottom: vh(10),
  },
  uploadText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey_1,
    fontSize: vw(14),
  },
  instructionText: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(12),
    marginTop: vh(4),
  },
  labelStyle: {
    width: vw(328),
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    alignSelf: 'center',
    color: colors.black,
    marginBottom: vh(8),
  },
  flex1: {
    flex: 1,
  },
});
