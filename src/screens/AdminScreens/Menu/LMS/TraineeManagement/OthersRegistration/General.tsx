import { Keyboard, StyleSheet, Text, View } from 'react-native';
import React, { createRef, useEffect, useRef, useState } from 'react';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { colors, vh, vw } from '../../../../../../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useAppSelector } from '../../../../../../hooks';
import { useDispatch } from 'react-redux';
import {
  saveAadharNumber,
  saveDob,
  saveFatherName,
  saveMobileNumber,
  saveName,
  savePlaceOfPosting,
  saveSelectedDepartment,
  saveSelectedDesignation,
  saveSelectedEducationalQualification,
  saveSelectedGender,
  saveSelectedMaritalStatus,
  saveSelectedPregnancyStatus,
  saveSelectedTrainingCenter,
  saveSelectedTrainingName,
  saveTrainingNameList,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

interface Props {
  route: any;
  navigation: NavigationType;
  goNext: any;
}

const General = (props: Props) => {
  const { navigation, goNext } = props;
  const input1_ref = useRef<any>(null);
  const input2_ref = useRef<any>(null);
  const input3_ref = useRef<any>(null);
  const input4_ref = useRef<any>(null);
  const input5_ref = useRef<any>(null);
  const { crediantialData } = useAppSelector(state => state.Auth);

  const tenantId = crediantialData.user[0].tenantId;

  const [commonListApi] = useCommonDropdownListMutation();
  const dispatch = useDispatch();
  const {
    trainingCenterList,
    selectedTrainingCenter,
    trainingNameList,
    selectedTrainingName,
    name,
    genderList,
    selectedGender,
    maritalStatusList,
    selectedMaritalStatus,
    pregnancyStatusList,
    selectedPregnancyStatus,
    fatherName,
    dob,
    aadharNumber,
    mobileNumber,
    educationalQualificationList,
    selectedEducationalQualification,
    departmentList,
    selectedDepartment,
    designationList,
    selectedDesignation,
    placeOfPosting,
  } = useAppSelector(state => state.otherRegistration);
  const [loader, setLoader] = useState(false);

  const [errors, setErrors] = React.useState<any>({});

  const [localForm, setLocalForm] = useState({
    selectedTrainingCenter: selectedTrainingCenter,
    selectedTrainingName: selectedTrainingName,
    name: name,
    selectedGender: selectedGender,
    selectedMaritalStatus: selectedMaritalStatus,
    selectedPregnancyStatus: selectedPregnancyStatus,
    fatherName: fatherName,
    dob: dob,
    selectedEducationalQualification: selectedEducationalQualification,
    selectedDepartment: selectedDepartment,
    selectedDesignation: selectedDesignation,
    aadharNumber: aadharNumber,
    mobileNumber: mobileNumber,
    placeOfPosting: placeOfPosting,
    trainingNameList: trainingNameList,
  });

  const generalSchema = Yup.object().shape({
    placeOfPosting: Yup.string().required('Place of posting is required'),

    selectedDesignation: Yup.object({
      name: Yup.string().required('Designation is required'),
    }),

    selectedDepartment: Yup.object({
      name: Yup.string().required('Department is required'),
    }),

    selectedEducationalQualification: Yup.object({
      name: Yup.string().required('Educational Qualification is required'),
    }),

    mobileNumber: Yup.string()
      .required('Mobile number is required')
      .length(10, 'Mobile number must be 10 digits'),
    aadharNumber: Yup.string()
      .required('Aadhar Number is required')
      .length(12, 'Aadhar must be 12 digits'),
    dob: Yup.string().required('DOB is required'),

    fatherName: Yup.string().required('Father name is required'),

    selectedPregnancyStatus:
      selectedGender.id === 'Female' && selectedMaritalStatus.id === 'M'
        ? Yup.object({
            name: Yup.string().required('Pregnancy Status is required'),
          })
        : Yup.mixed().notRequired(),
    selectedMaritalStatus: Yup.object({
      name: Yup.string().required('Marital Status is required'),
    }),
    selectedGender: Yup.object({
      name: Yup.string().required('Gender is required'),
    }),

    name: Yup.string().required('Name is required'),

    selectedTrainingName: Yup.object({
      name: Yup.string().required('Training name is required'),
    }),

    selectedTrainingCenter: Yup.object({
      name: Yup.string().required('Training center is required'),
    }),
  });

  const handleNext = async () => {
    try {
      await generalSchema.validate({
        selectedTrainingCenter: localForm.selectedTrainingCenter,
        selectedTrainingName: localForm.selectedTrainingName,
        name: localForm.name,
        selectedGender: localForm.selectedGender,
        selectedMaritalStatus: localForm.selectedMaritalStatus,
        selectedPregnancyStatus: localForm.selectedPregnancyStatus,
        fatherName: localForm.fatherName,
        dob: localForm.dob,
        aadharNumber: localForm.aadharNumber,
        mobileNumber: localForm.mobileNumber,
        selectedEducationalQualification:
          localForm.selectedEducationalQualification,
        selectedDepartment: localForm.selectedDepartment,
        selectedDesignation: localForm.selectedDesignation,
        placeOfPosting: localForm.placeOfPosting,
      });
      setErrors({});
      dispatch(saveName(localForm.name));
      dispatch(saveFatherName(localForm.fatherName));
      dispatch(saveAadharNumber(localForm.aadharNumber));
      dispatch(saveMobileNumber(localForm.mobileNumber));
      dispatch(savePlaceOfPosting(localForm.placeOfPosting));
      dispatch(saveDob(localForm.dob));

      dispatch(saveSelectedDepartment(localForm.selectedDepartment));
      dispatch(saveSelectedDesignation(localForm.selectedDesignation));
      dispatch(
        saveSelectedEducationalQualification(
          localForm.selectedEducationalQualification,
        ),
      );
      dispatch(saveSelectedGender(localForm.selectedGender));
      dispatch(saveSelectedMaritalStatus(localForm.selectedMaritalStatus));
      dispatch(saveSelectedPregnancyStatus(localForm.selectedPregnancyStatus));
      dispatch(saveSelectedTrainingCenter(localForm.selectedTrainingCenter));
      dispatch(saveSelectedTrainingName(localForm.selectedTrainingName));
      dispatch(saveTrainingNameList(localForm.trainingNameList));
      goNext();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const getAllTraining = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('trainingNameList', res.data || []);
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

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const setValue = (key: any, value: any) => {
    setLocalForm((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
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
          label={'Training Center'}
          placeholder={'Training Center'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Center',
              Data: trainingCenterList,
              selectedData: localForm.selectedTrainingCenter,
              setSelectedData: (data: any) => {
                setValue('selectedTrainingCenter', data);
                setValue('selectedTrainingName', {});
                getAllTraining(data.name);
                setErrors({ ...errors, 'selectedTrainingCenter.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          isMandatory
          inputText={localForm.selectedTrainingCenter?.name}
          errorMessage={errors['selectedTrainingCenter.name']}
          isDisabled={tenantId !== 3}
        />

        <DropDownOrganism
          label={'Training Name'}
          placeholder={'Training Name'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Name',
              Data: localForm.trainingNameList,
              selectedData: localForm.selectedTrainingName,
              setSelectedData: (data: any) => {
                setValue('selectedTrainingName', data);
                setErrors({ ...errors, 'selectedTrainingName.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          isMandatory
          inputText={localForm.selectedTrainingName?.name}
          errorMessage={errors['selectedTrainingName.name']}
        />
        <TextInputOrganisms
          label={'Name'}
          placeholder={'Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={localForm.name}
          onChangeText={(val: any) => {
            setValue('name', val);
            setErrors({ ...errors, name: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          isMandatory
          errorMessage={errors.name}
        />
        <DropDownOrganism
          label={'Gender'}
          placeholder={'Gender'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Gender',
              Data: genderList,
              selectedData: localForm.selectedGender,
              setSelectedData: (data: any) => {
                setValue('selectedGender', data);
                setValue('selectedMaritalStatus', {});
                setErrors({ ...errors, 'selectedGender.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localForm.selectedGender?.name}
          isMandatory
          errorMessage={errors['selectedGender.name']}
        />
        <DropDownOrganism
          label={'Marital Status'}
          placeholder={'Marital Status'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Marital Status',
              Data: maritalStatusList,
              selectedData: localForm.selectedMaritalStatus,
              setSelectedData: (data: any) => {
                setValue('selectedMaritalStatus', data);
                if (localForm.selectedMaritalStatus?.id === 'U') {
                  setValue('selectedPregnancyStatus', {});
                }
                setErrors({ ...errors, 'selectedMaritalStatus.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localForm.selectedMaritalStatus?.name}
          isMandatory
          errorMessage={errors['selectedMaritalStatus.name']}
        />

        {localForm.selectedGender?.name === 'Female' &&
          localForm.selectedMaritalStatus?.id === 'M' && (
            <DropDownOrganism
              label={'Pregnancy Status'}
              placeholder={'Pregnancy Status'}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: 'Pregnancy Status',
                  Data: pregnancyStatusList,
                  selectedData: localForm.selectedPregnancyStatus,
                  setSelectedData: (data: any) => {
                    setValue('selectedPregnancyStatus', data);
                    setErrors({
                      ...errors,
                      'selectedPregnancyStatus.name': '',
                    });
                  },
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={localForm.selectedPregnancyStatus?.name}
              isMandatory
              errorMessage={errors['selectedPregnancyStatus.name']}
            />
          )}
        <TextInputOrganisms
          label={'Father Name'}
          placeholder={'Father Name'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={localForm.fatherName}
          onChangeText={(val: any) => {
            setValue('fatherName', val);
            setErrors({ ...errors, fatherName: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          isMandatory
          errorMessage={errors.fatherName}
        />

        <DateInputOrganism
          label={'DOB'}
          placeholder={'DOB'}
          value={localForm.dob}
          onChangeText={(val: any) => {
            setValue('dob', val);
            setErrors({ ...errors, dob: '' });
          }}
          fieldName={'date'}
          dateFormat="DD-MM-YYYY"
          isMandatory
          errorMessage={errors.dob}
          maxDate={eighteenYearsAgo}
        />

        <TextInputOrganisms
          label={'Aadhar Number'}
          placeholder={'Aadhar Number'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={localForm.aadharNumber}
          onChangeText={(val: any) => {
            setValue('aadharNumber', normalizeNumber(val));
            setErrors({ ...errors, aadharNumber: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          maxLength={12}
          keyboardType="numeric"
          isMandatory
          errorMessage={errors.aadharNumber}
        />
        <TextInputOrganisms
          label={'Mobile Number'}
          placeholder={'Mobile Number'}
          ref={input4_ref}
          onSubmitEditing={() => input5_ref.current.focus()}
          value={localForm.mobileNumber}
          onChangeText={(val: any) => {
            setValue('mobileNumber', normalizeNumber(val));
            setErrors({ ...errors, mobileNumber: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          maxLength={10}
          keyboardType="numeric"
          isMandatory
          errorMessage={errors.mobileNumber}
        />
        <DropDownOrganism
          label={'Educational Qualification'}
          placeholder={'Educational Qualification'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Educational Qualification',
              Data: educationalQualificationList,
              selectedData: localForm.selectedEducationalQualification,
              setSelectedData: (data: any) => {
                setValue('selectedEducationalQualification', data);
                setErrors({
                  ...errors,
                  'selectedEducationalQualification.name': '',
                });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localForm.selectedEducationalQualification?.name}
          isMandatory
          errorMessage={errors['selectedEducationalQualification.name']}
        />

        <DropDownOrganism
          label={'Department'}
          placeholder={'Department'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Department',
              Data: departmentList,
              selectedData: localForm.selectedDepartment,
              setSelectedData: (data: any) => {
                setValue('selectedDepartment', data);
                setErrors({ ...errors, 'selectedDepartment.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localForm.selectedDepartment?.name}
          isMandatory
          errorMessage={errors['selectedDepartment.name']}
        />
        <DropDownOrganism
          label={'Designation'}
          placeholder={'Designation'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Designation',
              Data: designationList,
              selectedData: localForm.selectedDesignation,
              setSelectedData: (data: any) => {
                setValue('selectedDesignation', data);
                setErrors({ ...errors, 'selectedDesignation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={localForm.selectedDesignation?.name}
          isMandatory
          errorMessage={errors['selectedDesignation.name']}
        />

        <TextInputOrganisms
          label={'Place of Posting'}
          placeholder={'Place of Posting'}
          ref={input5_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={localForm.placeOfPosting}
          onChangeText={(val: any) => {
            setValue('placeOfPosting', val);
            setErrors({ ...errors, placeOfPosting: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          isMandatory
          errorMessage={errors.placeOfPosting}
        />
      </KeyboardAwareScrollView>
      <ButtonOrganism
        bttnText="Next"
        onPress={handleNext}
        containerStyle={{ width: vw(328), marginBottom: vh(30) }}
      />
    </View>
  );
};

export default General;

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
