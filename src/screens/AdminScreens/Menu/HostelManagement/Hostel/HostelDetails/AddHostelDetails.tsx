import { StyleSheet, TouchableOpacity } from 'react-native';
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
import TextAtom from '../../../../../../components/atoms/TextAtom';
import RadioSelectableOrganism from '../../../../../../components/organisms/RadioSelectableOrganism';
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
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

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
      isNullUndefined(item)
        ? strings.hostelManagement.addHostelDetails.addTitle
        : strings.hostelManagement.addHostelDetails.editTitle,
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
      name: Yup.string().required(
        strings.hostelManagement.addHostelDetails.required.totalCapacity,
      ),
    }),
    totalCapicty: Yup.string().required(
      strings.hostelManagement.addHostelDetails.required.totalCapacity,
    ),
    contactNumber: Yup.string()
      .required(
        strings.hostelManagement.addHostelDetails.required.contactNumber,
      )
      .max(10, strings.hostelManagement.addHostelDetails.errors.validContact)
      .min(10, strings.hostelManagement.addHostelDetails.errors.validContact)
      .matches(
        mobileRegex,
        strings.hostelManagement.addHostelDetails.errors.validContact,
      ),
    contactPerson: Yup.string().required(
      strings.hostelManagement.addHostelDetails.required.contactPerson,
    ),
    noOfFloor: Yup.string().required(
      strings.hostelManagement.addFloorDetails.required.noOfRooms,
    ),
    hostelAddress: Yup.string().required(
      strings.hostelManagement.addHostelDetails.required.hostelAddress,
    ),
    hostelName: Yup.string().required(
      strings.hostelManagement.addBedDetails.required.hostel,
    ),
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

  const handleAlternateChange = (text: any, index: any) => {
    const numeric = text.replaceAll(/\D/g, '').slice(0, 10);

    const updated = [...form.alternateContactNo];
    updated[index] = numeric;

    // 1) Check duplicate inside alternate numbers
    const duplicates = updated.filter((n, i) => n && updated.indexOf(n) !== i);
    if (duplicates.length > 0) {
      Toast.show({
        type: 'error',
        text2:
          strings.hostelManagement.addHostelDetails.errors.duplicateAlternate,
      });
      return;
    }

    // 2) Check same as main contact number
    if (numeric && numeric === form.contactNumber) {
      Toast.show({
        type: 'error',
        text2: strings.hostelManagement.addHostelDetails.errors.sameAsMain,
      });
      return;
    }

    setValue('alternateContactNo', updated);
  };

  const handleAddAlternate = () => {
    if (form.alternateContactNo.length >= 2) {
      Toast.show({
        type: 'error',
        text2: strings.hostelManagement.addHostelDetails.errors.maxAlternate,
      });
      return;
    }

    if (form.alternateContactNo.includes('')) {
      Toast.show({
        type: 'error',
        text2: strings.hostelManagement.addHostelDetails.errors.fillFirst,
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
          label={strings.hostelManagement.addBedDetails.hostelName}
          placeholder={strings.hostelManagement.addBedDetails.hostelName}
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
          label={strings.hostelManagement.addHostelDetails.hostelAddress}
          placeholder={strings.hostelManagement.addHostelDetails.hostelAddress}
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
          label={strings.hostelManagement.addHostelDetails.noOfFloor}
          placeholder={strings.hostelManagement.addHostelDetails.noOfFloor}
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
          label={strings.hostelManagement.addHostelDetails.contactPerson}
          placeholder={strings.hostelManagement.addHostelDetails.contactPerson}
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
          label={strings.hostelManagement.addHostelDetails.contactNumber}
          placeholder={strings.hostelManagement.addHostelDetails.contactNumber}
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
          label={strings.hostelManagement.addHostelDetails.totalCapacity}
          placeholder={strings.hostelManagement.addHostelDetails.totalCapacity}
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
          label={strings.hostelManagement.addHostelDetails.trainingCenter}
          placeholder={strings.hostelManagement.addHostelDetails.trainingCenter}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addHostelDetails.trainingCenter,
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
          isDisabled={tenantId !== 3}
        />
        {isNullUndefined(item) && (
          <RadioSelectableOrganism
            data={[
              {
                id: strings.hostelManagement.addBedDetails.active,
                value: strings.hostelManagement.addBedDetails.active,
              },
              {
                id: strings.hostelManagement.addBedDetails.inactive,
                value: strings.hostelManagement.addBedDetails.inactive,
              },
            ]}
            onSelect={(item: any) => {
              setValue('status', item);
              setErrors({ ...errors, 'status.id': '' });
            }}
            label={strings.hostelManagement.addBedDetails.status}
            selectedType={form.status}
            typeName={'value'}
            typeId={'id'}
            isMandatory
            errorMessage={errors['status.id']}
          />
        )}

        {form?.alternateContactNo?.map((num: any, index: any) => (
          <ViewAtom
            key={index.toString() + num?.toString()}
            style={styles.alternateRow}
          >
            <TextInputOrganisms
              label={
                index === 0
                  ? strings.hostelManagement.addHostelDetails.alternateContactNo
                  : `${
                      strings.hostelManagement.addHostelDetails
                        .alternateContactNo
                    } ${index + 1}`
              }
              placeholder={
                strings.hostelManagement.addHostelDetails.enterTenDigit
              }
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
                style={styles.addBtn}
              >
                <TextAtom style={styles.btnText}>+</TextAtom>
              </TouchableOpacity>
            )}
            {index === 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveAlternate(index)}
                style={styles.removeBtn}
              >
                <TextAtom style={styles.btnText}>–</TextAtom>
              </TouchableOpacity>
            )}
          </ViewAtom>
        ))}
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
  alternateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: vw(328),
    marginBottom: vh(10),
    marginLeft: vh(10),
  },
  addBtn: {
    width: vw(30),
    backgroundColor: colors.primary,
    height: vh(48),
    borderRadius: vw(6),
    marginTop: vh(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    width: vw(30),
    backgroundColor: colors.primary,
    height: vh(48),
    borderRadius: vw(6),
    marginTop: vh(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: colors.white, fontSize: vw(16) },
});
