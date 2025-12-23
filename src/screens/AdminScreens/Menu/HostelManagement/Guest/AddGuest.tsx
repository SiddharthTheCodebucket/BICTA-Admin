import { Keyboard, StyleSheet } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, strings, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  mobileRegex,
  normalizeNumber,
  emailRegex,
} from '../../../../../utils/CommonFunction';
import {
  useAddGuestMutation,
  useUpdateGuestMutation,
} from '../../../../../injectEndpoints/hostelEndpoints';
import { useAppSelector } from '../../../../../hooks';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddGuest = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();

  const [addGuestApi] = useAddGuestMutation();
  const [updateGuestApi] = useUpdateGuestMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item)
        ? strings.addGuest.addGuest
        : strings.addGuest.editGuest,
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
    if (!item) {
      if (tenantId === 1) {
        setValue('bipardLocation', {
          id: strings.dashboardIndex.gaya,
          name: strings.dashboardIndex.gaya,
        });
      } else if (tenantId === 2) {
        setValue('bipardLocation', {
          id: strings.dashboardIndex.patna,
          name: strings.dashboardIndex.patna,
        });
      }
      return;
    }

    const locationMap: any = {
      1: { id: strings.dashboardIndex.gaya, name: strings.dashboardIndex.gaya },
      2: {
        id: strings.dashboardIndex.patna,
        name: strings.dashboardIndex.patna,
      },
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
      name: Yup.string().required(strings.addGuest.genderRequired),
    }),
    mobileNo: Yup.string()
      .required(strings.addGuest.mobileNumberRequired)
      .max(10, strings.enter_valid_mobile)
      .min(10, strings.enter_valid_mobile)
      .matches(mobileRegex, strings.enter_valid_mobile),
    officeEmail: Yup.string()
      .required(strings.addGuest.officeEmailRequired)
      .matches(emailRegex, strings.addGuest.enterValidOfficeEmail),
    name: Yup.string().required(strings.addGuest.nameRequired),
    bipardLocation: Yup.object({
      name: Yup.string().required(strings.addGuest.bipardLocationRequired),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateGuestDetails();
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

  const updateGuestDetails = () => {
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
        extraScrollHeight={vh(80)}
      >
        <DropDownOrganism
          label={strings.addGuest.bipardLocation}
          placeholder={strings.addGuest.bipardLocation}
          onPress={() => {
            if (tenantId !== 3) return;
            navigation.navigate('DropDownModal', {
              name: strings.addGuest.bipardLocation,
              Data: [
                {
                  id: strings.dashboardIndex.gaya,
                  name: strings.dashboardIndex.gaya,
                },
                {
                  id: strings.dashboardIndex.patna,
                  name: strings.dashboardIndex.patna,
                },
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
          isDisabled={tenantId !== 3}
        />
        <TextInputOrganisms
          label={strings.addGuest.name}
          placeholder={strings.addGuest.name}
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
          label={strings.addGuest.officeEmail}
          placeholder={strings.addGuest.officeEmail}
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
          label={strings.addGuest.mobileNumber}
          placeholder={strings.addGuest.mobileNumber}
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
          label={strings.addGuest.designation}
          placeholder={strings.addGuest.designation}
          ref={input4_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.designation}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('designation', val);
          }}
        />
        <DropDownOrganism
          label={strings.addGuest.gender}
          placeholder={strings.addGuest.gender}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.addGuest.gender,
              Data: [
                { id: strings.addGuest.male, name: strings.addGuest.male },
                { id: strings.addGuest.female, name: strings.addGuest.female },
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
      <ButtonOrganism
        onPress={onSubmit}
        bttnText={item ? strings.addGuest.update : strings.addGuest.add}
      />
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
  flex1: {
    flex: 1,
  },
});
