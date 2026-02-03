import { Keyboard, StyleSheet } from 'react-native';
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
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useBudgetAddParticularsMutation,
  useBudgetUpdateParticularsMutation,
} from '../../../../../../injectEndpoints/budgetManagementEndpoints';
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  particularName: '',
  particularRate: '',
  sessionInclude: {},
};

const AddParticulars = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useBudgetAddParticularsMutation();
  const [updateApi] = useBudgetUpdateParticularsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Particular Data' : 'Update Particular Data',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getBipardCenter();
    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId];
    setForm((prev: any) => ({
      ...prev,
      bipardLocation: selectedLocation,
      particularName: item.particulars || '',
      particularRate: item.rate + '' || '',
      sessionInclude: {
        id: item.isSessionInclude,
        value: item.isSessionInclude,
      },
    }));
  }, [item]);

  useEffect(() => {
    if (item?.isLmsTraining === 'Yes' && form.trainingList?.length > 0) {
      const selectedTraining = form.trainingList.find(
        (t: any) => t.id === item?.lmsTrainingId,
      );

      if (selectedTraining) {
        setForm((prev: any) => ({
          ...prev,
          selectedTraining,
        }));
      }
    }
  }, [form.trainingList]);

  const schema = Yup.object().shape({
    sessionInclude: Yup.object({
      id: Yup.string().required('Session include is required'),
    }),
    particularRate: Yup.string().required('Particular Rate is required'),
    particularName: Yup.string().required('Particular Name is required'),
    bipardLocation: Yup.object({
      name: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.location,
      ),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateDetails();
      } else {
        addDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    setLoader(true);
    let params = {
      id: null,
      bipardCentre: [form.bipardLocation?.name],
      particulars: form.particularName,
      rate: form.particularRate,
      isSessionInclude: form.sessionInclude.id,
    };
    addApi(params)
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
  const updateDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      bipardCentre: [form.bipardLocation?.name],
      particulars: form.particularName,
      rate: form.particularRate,
      isSessionInclude: form.sessionInclude.id,
    };

    updateApi(params)
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
  const getBipardCenter = () => {
    setLoader(true);
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('bipardLocationList', res.data);
        if (!item) {
          if (tenantId === 1) {
            setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
          } else if (tenantId === 2) {
            setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
          }
        }

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
        <DropDownOrganism
          label={strings.hostelManagement.addBedDetails.bipardLocation}
          placeholder={strings.hostelManagement.addBedDetails.bipardLocation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addBedDetails.bipardLocation,
              Data: [
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
              ],
              selectedData: form.bipardLocationList,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  bipardLocation: data,
                }));
                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
          isDisabled={tenantId !== 3}
        />

        <TextInputOrganisms
          label={'Particular Name'}
          placeholder={'Particular Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref?.current?.focus()}
          value={form.particularName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('particularName', val);
            setErrors({ ...errors, particularName: '' });
          }}
          isMandatory
          errorMessage={errors.particularName}
        />

        <TextInputOrganisms
          label={'Particular Rate'}
          placeholder={'Particular Rate'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.particularRate}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('particularRate', val);
            setErrors({ ...errors, particularRate: '' });
          }}
          isMandatory
          errorMessage={errors.particularRate}
          maxLength={10}
          keyboardType="numeric"
        />

        <RadioSelectableOrganism
          data={[
            {
              id: 'Yes',
              value: 'Yes',
            },
            {
              id: 'No',
              value: 'No',
            },
          ]}
          onSelect={(item: any) => {
            setValue('sessionInclude', item);
            setErrors({ ...errors, 'sessionInclude.id': '' });
          }}
          label={'Is Session Include'}
          selectedType={form.sessionInclude}
          typeName={'value'}
          typeId={'id'}
          isMandatory
          errorMessage={errors['sessionInclude.id']}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism
        onPress={onSubmit}
        bttnText={
          item
            ? strings.hostelManagement.addBedDetails.update
            : strings.hostelManagement.addBedDetails.add
        }
      />
    </SafeAreaView>
  );
};

export default AddParticulars;

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
