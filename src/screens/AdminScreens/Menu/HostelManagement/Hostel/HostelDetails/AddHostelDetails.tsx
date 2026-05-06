import {
  StyleSheet,
  View,
  ImageBackground,
  Keyboard,
  TextInput,
} from 'react-native';
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
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  isNullUndefined,
  mobileRegex,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useAddHostelDetailsMutation,
  useUpdateHostelDetailsMutation,
} from '../../../../../../injectEndpoints/hostelEndpoints';
import AdminTextInputField from '../../../../../../components/molecules/AdminTextInputField';
import {
  FormDropdownFieldWithTitle,
  FormSwitchWithTitle,
  FormTextInputWithTitle,
  FormGradientButton,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { globalStyles } from '../../../../../../utils/globalStyles';
import { images } from '../../../../../../constants';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  hostelName: '',
  hostelAddress: '',
  noOfFloor: '',
  contactPerson: '',
  contactNumber: '',
  totalCapicty: '',
  trainingCenterList: [],
  trainingCenter: {},
  status: { id: 'Inactive', value: 'Inactive' },
  alternateContactNo: '',
};

const AddHostelDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();
  const input6_ref: any = createRef();
  const input7_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addHostelDetailsApi] = useAddHostelDetailsMutation();
  const [updateHostelDetailsApi] = useUpdateHostelDetailsMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Create Hostel' : 'Edit Hostel',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: '#002147',
        titleColor: colors.white,
        backIconColor: colors.white,
      },
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
    getTrainingCenter();

    if (!item) return;

    const selectedTrainingCenter = {
      id: item.trainingCentre,
      name: item.trainingCentre,
    };

    setForm((prev: any) => ({
      ...prev,
      hostelName: item.hostelName || '',
      hostelAddress: item.hostelAddress || '',
      noOfFloor: item.noOfFloors?.toString() || '',
      contactPerson: item.contactPerson || '',
      contactNumber: item.contactNo || '',
      totalCapicty: item.totalCapacity?.toString() || '',
      trainingCenter: selectedTrainingCenter,
      status: {
        id: item.status,
        value: item.status,
      },
      alternateContactNo: item.alternateContactNo?.[0] || '',
    }));
  }, [item]);

  const schema = Yup.object().shape({
    status: Yup.object().nullable().required('Status is required'),
    trainingCenter: Yup.object({
      name: Yup.string().required('Training Centre is required'),
    }),
    totalCapicty: Yup.string().required('Total Capacity is required'),
    contactNumber: Yup.string()
      .required('Contact Number is required')
      .max(10, 'Invalid Contact Number')
      .min(10, 'Invalid Contact Number')
      .matches(mobileRegex, 'Invalid Contact Number'),
    contactPerson: Yup.string().required('Contact Person is required'),
    noOfFloor: Yup.string().required('No. of Floors is required'),
    hostelAddress: Yup.string().required('Hostel Address is required'),
    hostelName: Yup.string().required('Hostel Name is required'),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateHostelDetails();
      } else {
        addHostelDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addHostelDetails = () => {
    setLoader(true);
    let params = {
      id: null,
      trainingCentre: form.trainingCenter?.name,
      hostelName: form.hostelName,
      noOfFloors: form.noOfFloor,
      hostelAddress: form.hostelAddress,
      contactPerson: form.contactPerson,
      alternateContactNo: form.alternateContactNo
        ? [form.alternateContactNo]
        : [],
      contactNo: form.contactNumber,
      totalCapacity: form.totalCapicty,
      status: form.status.id,
    };
    addHostelDetailsApi(params)
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

  const updateHostelDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      trainingCentre: form.trainingCenter?.name,
      hostelName: form.hostelName,
      noOfFloors: form.noOfFloor,
      hostelAddress: form.hostelAddress,
      contactPerson: form.contactPerson,
      alternateContactNo: form.alternateContactNo
        ? [form.alternateContactNo]
        : [],
      contactNo: form.contactNumber,
      totalCapacity: form.totalCapicty,
      status: form.status.id,
    };

    updateHostelDetailsApi(params)
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

  const getTrainingCenter = () => {
    setLoader(true);
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('trainingCenterList', res.data);
        if (!item) {
          if (tenantId === 1) {
            setValue('trainingCenter', { id: 'Gaya', name: 'Gaya' });
          } else if (tenantId === 2) {
            setValue('trainingCenter', { id: 'Patna', name: 'Patna' });
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
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <View style={globalStyles.adminFormCard}>
          <FormTextInputWithTitle
            title="Hostel Name"
            placeholder="Enter Name"
            ref={input1_ref}
            onSubmitEditing={() => input2_ref.current.focus()}
            value={form.hostelName}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              setValue('hostelName', val);
              setErrors({ ...errors, hostelName: '' });
            }}
            isMandatory
            errorMessage={errors.hostelName}
          />

          <FormTextInputWithTitle
            title="Hostel Address"
            placeholder="Enter Address"
            ref={input2_ref}
            onSubmitEditing={() => input3_ref.current.focus()}
            value={form.hostelAddress}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              setValue('hostelAddress', val);
              setErrors({ ...errors, hostelAddress: '' });
            }}
            isMandatory
            errorMessage={errors.hostelAddress}
          />

          <FormTextInputWithTitle
            title="No. of Floors"
            placeholder="Enter"
            ref={input3_ref}
            onSubmitEditing={() => input4_ref.current.focus()}
            value={form.noOfFloor}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              setValue('noOfFloor', normalizeNumber(val));
              setErrors({ ...errors, noOfFloor: '' });
            }}
            isMandatory
            errorMessage={errors.noOfFloor}
            maxLength={2}
            keyboardType="numeric"
          />

          <FormTextInputWithTitle
            title="Total Capacity"
            placeholder="Enter"
            ref={input4_ref}
            onSubmitEditing={() => input5_ref.current.focus()}
            returnKeyType={'next'}
            value={form.totalCapicty}
            onChangeText={(val: string) => {
              setValue('totalCapicty', normalizeNumber(val));
              setErrors({ ...errors, totalCapicty: '' });
            }}
            isMandatory
            errorMessage={errors.totalCapicty}
            maxLength={3}
            keyboardType="numeric"
          />

          <FormDropdownFieldWithTitle
            title="Select Training Centre"
            isMandatory
            data={form.trainingCenterList}
            value={form.trainingCenter?.id}
            placeholder="Select"
            labelField="name"
            valueField="id"
            disabled={tenantId !== 3}
            onChange={item => {
              const selectedItem = item as any;
              setValue('trainingCenter', selectedItem);
              setErrors({ ...errors, 'trainingCenter.name': '' });
            }}
            errorMessage={errors['trainingCenter.name']}
          />

          <FormTextInputWithTitle
            title="Contact Person"
            placeholder="Enter"
            ref={input5_ref}
            onSubmitEditing={() => input6_ref.current.focus()}
            value={form.contactPerson}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              setValue('contactPerson', val);
              setErrors({ ...errors, contactPerson: '' });
            }}
            isMandatory
            errorMessage={errors.contactPerson}
          />

          <FormTextInputWithTitle
            title="Contact No."
            placeholder="912345 00001"
            ref={input6_ref}
            onSubmitEditing={() => input7_ref.current.focus()}
            value={form.contactNumber}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              setValue('contactNumber', normalizeNumber(val));
              setErrors({ ...errors, contactNumber: '' });
            }}
            isMandatory
            errorMessage={errors.contactNumber}
            maxLength={10}
            keyboardType="numeric"
          />

          <FormTextInputWithTitle
            title="Alternate Contact No."
            placeholder="912345 00001"
            ref={input7_ref}
            onSubmitEditing={() => Keyboard.dismiss()}
            value={form.alternateContactNo}
            returnKeyType={'done'}
            onChangeText={(val: string) => {
              setValue('alternateContactNo', normalizeNumber(val));
              setErrors({ ...errors, alternateContactNo: '' });
            }}
            maxLength={10}
            keyboardType="numeric"
          />

          <FormSwitchWithTitle
            title="Status"
            data={[
              { id: 'Active', label: 'Active' },
              { id: 'Inactive', label: 'Inactive' },
            ]}
            selectedValue={form.status.id}
            onSelect={(item: any) => {
              setValue('status', { id: item.id, value: item.label });
            }}
            isMandatory
            errorMessage={errors['status.id']}
          />
        </View>

        <View style={styles.footerRow}>
          <FormWhiteButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            containerStyle={styles.footerButtonContainer}
          />

          <FormGradientButton
            title={item ? 'Update' : 'Add'}
            onPress={onSubmit}
            loading={loader}
            containerStyle={styles.footerButtonContainer}
            imageSource={images.buttonGrad_50}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddHostelDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(40),
    backgroundColor: '#F8F8F8',
  },
  footerRow: {
    // position: 'absolute',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerButtonContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
});
