import { Keyboard, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  mobileRegex,
  normalizeNumber,
  emailRegex,
} from '../../../../utils/CommonFunction';
import {
  useAddGuestMutation,
  useUpdateGuestMutation,
} from '../../../../injectEndpoints/hostelEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddGuest = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();

  const [addGuestApi] = useAddGuestMutation();
  const [updateGuestApi] = useUpdateGuestMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      !isNullUndefined(item) ? 'Edit Guest' : 'Add Guest',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    bipardLocation: {},
    name: '',
    officeEmail: '',
    mobileNo: '',
    designation: '',
    gender: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedLocation = locationMap[item.tenantId] || {};

    setForm({
      bipardLocation: selectedLocation,

      name: item.name || '',
      officeEmail: item.officeEmail || '',
      mobileNo: item.mobileNo || '',
      designation: item.designation || '',

      gender: item.gender ? { id: item.gender, name: item.gender } : {},
    });
  }, [item]);

  const schema = Yup.object().shape({
    gender: Yup.object({
      name: Yup.string().required('Gender is required'),
    }),
    // designation: Yup.string().required('Designation is required'),
    mobileNo: Yup.string()
      .required('Mobile number is required')
      .max(10, strings.enter_valid_mobile)
      .min(10, strings.enter_valid_mobile)
      .matches(mobileRegex, strings.enter_valid_mobile),
    officeEmail: Yup.string()
      .required('Office email is required')
      .matches(emailRegex, 'Enter valid office email'),
    name: Yup.string().required('Name is required'),
    bipardLocation: Yup.object({
      name: Yup.string().required('Bipard location is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateVehicleDetails();
      } else {
        addGuestDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addGuestDetails = () => {
    setLoader(true);
    let params = {
      guestId: null,
      bipardCentre: [form.bipardLocation?.name],
      name: form.name,
      officeEmail: form.officeEmail,
      mobileNo: form.mobileNo,
      designation: form.designation,
      gender: form.gender.id,
      selectRole: 22,
    };
    addGuestApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.Guest,
              },
            ],
          }),
        );
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  const updateVehicleDetails = () => {
    setLoader(true);
    let params = {
      guestId: item.guestId,
      bipardCentre: [form.bipardLocation?.name],
      name: form.name,
      officeEmail: form.officeEmail,
      mobileNo: form.mobileNo,
      designation: form.designation,
      gender: form.gender.id,
      selectRole: 22,
    };
    updateGuestApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.Guest,
              },
            ],
          }),
        );
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <DropDownOrganism
          label={'Bipard Location'}
          placeholder={'Bipard Location'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Bipard Location',
              Data: [
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
              ],
              selectedData: form.bipardLocation,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  bipardLocation: data,
                  vehicleColor: {},
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
        />
        <TextInputOrganisms
          label={'Name'}
          placeholder={'Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.name}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('name', val);
            setErrors({ ...errors, name: '' });
          }}
          isMandatory
          errorMessage={errors.name}
        />
        <TextInputOrganisms
          label={'Office Email'}
          placeholder={'Office Email'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.officeEmail}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('officeEmail', val);
            setErrors({ ...errors, officeEmail: '' });
          }}
          isMandatory
          errorMessage={errors.officeEmail}
        />
        <TextInputOrganisms
          label={'Mobile Number'}
          placeholder={'Mobile Number'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.mobileNo}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('mobileNo', formattedInput);
            setErrors({ ...errors, mobileNo: '' });
          }}
          isMandatory
          errorMessage={errors.mobileNo}
          maxLength={10}
          keyboardType="numeric"
        />
        <TextInputOrganisms
          label={'Designation'}
          placeholder={'Designation'}
          ref={input4_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.designation}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('designation', val);
            // setErrors({ ...errors, designation: '' });
          }}
          //   isMandatory
          //   errorMessage={errors.designation}
        />
        <DropDownOrganism
          label={'Gender'}
          placeholder={'Gender'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Gender',
              Data: [
                { id: 'Male', name: 'Male' },
                { id: 'Female', name: 'Female' },
              ],
              selectedData: form.gender,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  gender: data,
                }));

                setErrors({ ...errors, 'gender.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.gender?.name}
          isMandatory
          errorMessage={errors['gender.name']}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddGuest;

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
});
