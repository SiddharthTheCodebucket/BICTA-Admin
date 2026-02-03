import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import { useHrmsAddLeaveRequestMutation } from '../../../../../../injectEndpoints/hrmsEndpoints';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  employeeName: '',
  levaeTypeList: [],
  selectedLeaveType: {},
  fromDate: '',
  toDate: '',
  leaveSessionList: [{ id: 'Full Day', name: 'Full Day' }],
  selectedLeaveSession: {},
  file: {},
  leaveReason: '',
};

const AvailLeave = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item || {};

  const input1_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addLeaveApi] = useHrmsAddLeaveRequestMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Avail Leave');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      employeeName: item.name,
    }));
    getLeaveList();
  }, []);

  const schema = Yup.object().shape({
    leaveReason: Yup.string().required('Leave reason is required'),
    file: Yup.object({
      uri: Yup.string().required('File is required'),
    }),
    selectedLeaveSession: Yup.object({
      id: Yup.string().required('Leave Session is required'),
    }),
    toDate: Yup.string().required('To Date is required'),
    fromDate: Yup.string().required('From Date is required'),
    selectedLeaveType: Yup.object({
      id: Yup.string().required('Leave Type is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      addDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('employeeId', item.employeeId);
    formData.append('employeeName', item.name);
    formData.append('leaveTypeId', form.selectedLeaveType?.id);
    formData.append(
      'fromDate',
      moment(form.fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append(
      'toDate',
      moment(form.toDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append('leaveSession', form.selectedLeaveSession?.id);
    formData.append('leaveReason', form.leaveReason);
    if (form.attachment?.uri) {
      formData.append('attachment', {
        uri: form.file.uri,
        name: form.file.name || 'attachment.pdf',
        type: form.file.type,
      } as any);
    }
    addLeaveApi(formData)
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

  const getLeaveList = () => {
    setLoader(true);
    const params = {
      listType: 'select_leave_type',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('levaeTypeList', res.data);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
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
        <TextInputOrganisms
          label={'Employee Name'}
          placeholder={'Employee Name'}
          value={form.employeeName}
          onChangeText={() => {}}
          disabled
          editable={false}
        />
        <DropDownOrganism
          label={'Leave Type'}
          placeholder={'Leave Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Leave Type',
              Data: form.levaeTypeList,
              selectedData: form.selectedLeaveType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedLeaveType: data,
                }));

                setErrors({ ...errors, 'selectedLeaveType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedLeaveType?.name}
          isMandatory
          errorMessage={errors['selectedLeaveType.id']}
        />

        <DateInputOrganism
          label={'From Date'}
          placeholder={'From Date'}
          value={form.fromDate}
          onChangeText={(val: any) => {
            setValue('fromDate', val);
            setErrors({ ...errors, fromDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.fromDate}
        />
        <DateInputOrganism
          label={'To Date'}
          placeholder={'To Date'}
          value={form.toDate}
          onChangeText={(val: any) => {
            setValue('toDate', val);
            setErrors({ ...errors, toDate: '' });
          }}
          fieldName="date"
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.toDate}
          minDate={
            form.fromDate
              ? moment(form.fromDate, 'DD-MM-YYYY').toDate()
              : undefined
          }
        />
        <DropDownOrganism
          label={'Leave Session'}
          placeholder={'Leave Session'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Leave Session',
              Data: form.leaveSessionList,
              selectedData: form.selectedLeaveSession,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedLeaveSession: data,
                }));

                setErrors({ ...errors, 'selectedLeaveSession.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedLeaveSession?.name}
          isMandatory
          errorMessage={errors['selectedLeaveSession.id']}
        />

        <ImageUploadOrganism
          label={'Attachment'}
          isMandatory
          buttonText="Choose File"
          onSelectImage={(file: any) => {
            setValue('file', file);
            setErrors({ ...errors, 'file.uri': '' });
          }}
          defaultImage={form.file?.uri}
          errorMessage={errors['file.uri']}
          maxSizeMB={10}
        />

        <TextInputOrganisms
          label={'Leave Reason'}
          placeholder={'Leave Reason'}
          ref={input1_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.leaveReason}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('leaveReason', val);
            setErrors({ ...errors, leaveReason: '' });
          }}
          isMandatory
          errorMessage={errors.leaveReason}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={'Submit'} />
    </SafeAreaView>
  );
};

export default AvailLeave;

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
