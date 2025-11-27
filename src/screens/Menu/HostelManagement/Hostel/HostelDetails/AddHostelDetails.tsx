import { Keyboard, Linking, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, screensName, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../../../components/atoms/TextAtom';
import RadioSelectableOrganism from '../../../../../components/organisms/RadioSelectableOrganism';
import {
  isNullUndefined,
  mobileRegex,
  normalizeNumber,
} from '../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useAddHostelDetailsMutation,
  useUpdateHostelDetailsMutation,
} from '../../../../../injectEndpoints/hostelEndpoints';
import ViewAtom from '../../../../../components/atoms/ViewAtom';

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
  status: {},
  alternateContactNo: [''],
};

const AddHostelDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
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
      !isNullUndefined(item) ? 'Edit Hostel' : 'Add Hostel',
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

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const selectedTrainingCenter = {
      id: item.trainingCentre,
      name: item.trainingCentre,
    };

    setForm((prev: any) => ({
      ...prev,

      // FORM FIELDS PREFILL
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

      alternateContactNo:
        item.alternateContactNo?.length > 0
          ? [...item.alternateContactNo]
          : [''],
    }));
  }, [item]);

  const schema = Yup.object().shape({
    status: isNullUndefined(item)
      ? Yup.object({
          id: Yup.string().required('Status is required'),
        })
      : Yup.mixed().notRequired(),
    trainingCenter: Yup.object({
      name: Yup.string().required('Training center is required'),
    }),
    totalCapicty: Yup.string().required('Total capicty is required'),
    contactNumber: Yup.string()
      .required('Contact Number is required')
      .max(10, 'Enter valid contact number')
      .min(10, 'Enter valid contact number')
      .matches(mobileRegex, 'Enter valid contact number'),
    contactPerson: Yup.string().required('Contact person is required'),
    noOfFloor: Yup.string().required('No of floor is required'),
    hostelAddress: Yup.string().required('Hostel Address is required'),
    hostelName: Yup.string().required('Hostel name is required'),
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
      alternateContactNo: form.alternateContactNo.filter(
        (num: any) => num && num.trim() !== '',
      ),
      contactNo: form.contactNumber,
      totalCapacity: form.totalCapicty,
      status: form.status.id,
    };
    addHostelDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.HostelDetails,
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
  const updateHostelDetails = () => {
    setLoader(true);
    let params = {
      id: item.id,
      trainingCentre: form.trainingCenter?.name,
      hostelName: form.hostelName,
      noOfFloors: form.noOfFloor,
      hostelAddress: form.hostelAddress,
      contactPerson: form.contactPerson,
      alternateContactNo: form.alternateContactNo.filter(
        (num: any) => num && num.trim() !== '',
      ),
      contactNo: form.contactNumber,
      totalCapacity: form.totalCapicty,
      status: form.status.id,
    };

    updateHostelDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.HostelDetails,
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

  const handleAlternateChange = (text: any, index: any) => {
    const numeric = text.replace(/[^0-9]/g, '').slice(0, 10);

    const updated = [...form.alternateContactNo];
    updated[index] = numeric;

    // 1) Check duplicate inside alternate numbers
    const duplicates = updated.filter((n, i) => n && updated.indexOf(n) !== i);
    if (duplicates.length > 0) {
      Toast.show({
        type: 'error',
        text2: 'Alternate numbers cannot be same',
      });
      return;
    }

    // 2) Check same as main contact number
    if (numeric && numeric === form.contactNumber) {
      Toast.show({
        type: 'error',
        text2: 'Alternate number cannot be same as Contact Number',
      });
      return;
    }

    setValue('alternateContactNo', updated);
  };

  const handleAddAlternate = () => {
    if (form.alternateContactNo.length >= 2) {
      Toast.show({
        type: 'error',
        text2: 'You can add only 2 alternate contact numbers',
      });
      return;
    }

    if (form.alternateContactNo.includes('')) {
      Toast.show({
        type: 'error',
        text2: 'Please fill the first alternate number before adding another',
      });
      return;
    }

    setValue('alternateContactNo', [...form.alternateContactNo, '']);
  };

  const handleRemoveAlternate = (index: any) => {
    const updated = form.alternateContactNo.filter(
      (_: any, i: any) => i !== index,
    );
    setValue('alternateContactNo', updated);
  };

  console.log('form', form);
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
        <TextInputOrganisms
          label={'Hostel Name'}
          placeholder={'Hostel Name'}
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

        <TextInputOrganisms
          label={'Hostel Address'}
          placeholder={'Hostel Address'}
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

        <TextInputOrganisms
          label={'No Of Floor'}
          placeholder={'No Of Floor'}
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

        <TextInputOrganisms
          label={'Contact Person'}
          placeholder={'Contact Person'}
          ref={input4_ref}
          onSubmitEditing={() => input5_ref.current.focus()}
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

        <TextInputOrganisms
          label={'Contact Number'}
          placeholder={'Contact Number'}
          ref={input5_ref}
          onSubmitEditing={() => input6_ref.current.focus()}
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

        <TextInputOrganisms
          label={'Total Capacity'}
          placeholder={'Total Capacity'}
          ref={input6_ref}
          onSubmitEditing={() => input7_ref.current.focus()}
          returnKeyType={'done'}
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
        <DropDownOrganism
          label={'Training Center'}
          placeholder={'Training Center'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Center',
              Data: form.trainingCenterList,
              selectedData: form.trainingCenter,
              setSelectedData: (data: any) => {
                setValue('trainingCenter', data);
                setErrors({ ...errors, 'trainingCenter.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.trainingCenter?.name}
          isMandatory
          errorMessage={errors['trainingCenter.name']}
        />
        {isNullUndefined(item) && (
          <RadioSelectableOrganism
            data={[
              { id: 'Active', value: 'Active' },
              { id: 'Inactive', value: 'Inactive' },
            ]}
            onSelect={(item: any) => {
              setValue('status', item);
              setErrors({ ...errors, 'status.id': '' });
            }}
            label={'Status'}
            selectedType={form.status}
            typeName={'value'}
            typeId={'id'}
            isMandatory
            errorMessage={errors['status.id']}
          />
        )}

        {form?.alternateContactNo?.map((num: any, index: any) => (
          <ViewAtom
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: vw(328),
              marginBottom: vh(10),
              marginLeft: vh(10),
            }}
          >
            <TextInputOrganisms
              label={
                index === 0
                  ? 'Alternate Contact Number'
                  : `Alternate Contact Number ${index + 1}`
              }
              placeholder={'Enter 10 digit number'}
              value={num}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(txt: any) => handleAlternateChange(txt, index)}
              style={{ width: vw(280) }}
              labelStyle={{ width: vw(280) }}
            />

            {index === 0 && form?.alternateContactNo?.length < 2 && (
              <TouchableOpacity
                onPress={handleAddAlternate}
                style={{
                  width: vw(30),
                  backgroundColor: colors.primary,
                  height: vh(48),
                  borderRadius: vw(6),
                  marginTop: vh(15),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TextAtom style={{ color: '#fff', fontSize: vw(16) }}>
                  +
                </TextAtom>
              </TouchableOpacity>
            )}
            {index === 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveAlternate(index)}
                style={{
                  width: vw(30),
                  backgroundColor: colors.primary,
                  height: vh(48),
                  borderRadius: vw(6),
                  marginTop: vh(15),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TextAtom style={{ color: '#fff', fontSize: vw(16) }}>
                  –
                </TextAtom>
              </TouchableOpacity>
            )}
          </ViewAtom>
        ))}
      </KeyboardAwareScrollView>

      <ButtonOrganism onPress={onSubmit} bttnText={item ? 'Update' : 'Add'} />
    </SafeAreaView>
  );
};

export default AddHostelDetails;

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
});
