import React, { useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';

import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import { colors, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

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

import {
  FormDropdownFieldWithTitle,
  FormFieldWrapper,
  FormGradientButton,
  FormTextInputWithTitle,
} from '../../../../../../components/templates';

type DropdownItem = {
  [key: string]: any;
};

type LocalFormType = {
  selectedTrainingCenter: DropdownItem;
  selectedTrainingName: DropdownItem;
  name: string;
  selectedGender: DropdownItem;
  selectedMaritalStatus: DropdownItem;
  selectedPregnancyStatus: DropdownItem;
  fatherName: string;
  dob: string;
  selectedEducationalQualification: DropdownItem;
  selectedDepartment: DropdownItem;
  selectedDesignation: DropdownItem;
  aadharNumber: string;
  mobileNumber: string;
  placeOfPosting: string;
  trainingNameList: DropdownItem[];
};

interface Props {
  navigation: NavigationType;
  goNext: any;
}

const OtherRegistrationGeneral = (props: Props) => {
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
  const [errors, setErrors] = useState<any>({});

  const [localForm, setLocalForm] = useState<LocalFormType>({
    selectedTrainingCenter: selectedTrainingCenter || {},
    selectedTrainingName: selectedTrainingName || {},
    name: name || '',
    selectedGender: selectedGender || {},
    selectedMaritalStatus: selectedMaritalStatus || {},
    selectedPregnancyStatus: selectedPregnancyStatus || {},
    fatherName: fatherName || '',
    dob: dob || '',
    selectedEducationalQualification: selectedEducationalQualification || {},
    selectedDepartment: selectedDepartment || {},
    selectedDesignation: selectedDesignation || {},
    aadharNumber: aadharNumber || '',
    mobileNumber: mobileNumber || '',
    placeOfPosting: placeOfPosting || '',
    trainingNameList: Array.isArray(trainingNameList) ? trainingNameList : [],
  });

  const setValue = (key: keyof LocalFormType, value: any) => {
    setLocalForm(prev => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev: any) => ({ ...prev, [key]: '' }));
  };

  const generalSchema = Yup.object().shape({
    selectedTrainingCenter: Yup.object({
      name: Yup.string().required('Training center is required'),
    }),
    selectedTrainingName: Yup.object({
      name: Yup.string().required('Training name is required'),
    }),
    name: Yup.string().required('Name is required'),
    selectedGender: Yup.object({
      name: Yup.string().required('Gender is required'),
    }),
    selectedMaritalStatus: Yup.object({
      name: Yup.string().required('Marital Status is required'),
    }),
    // selectedPregnancyStatus: Yup.mixed().when(
    //   ['selectedGender', 'selectedMaritalStatus'],
    //   {
    //     is: (gender: any, marital: any) =>
    //       gender?.name === 'Female' && marital?.id === 'M',
    //     then: Yup.object({
    //       name: Yup.string().required('Pregnancy Status is required'),
    //     }),
    //     otherwise: Yup.mixed().notRequired(),
    //   },
    // ),

    selectedPregnancyStatus: Yup.mixed().when(
      ['selectedGender', 'selectedMaritalStatus'],
      (selectedGender: any, selectedMaritalStatus: any, schema: any) => {
        if (
          selectedGender?.name === 'Female' &&
          selectedMaritalStatus?.id === 'M'
        ) {
          return Yup.object({
            name: Yup.string().required('Pregnancy Status is required'),
          });
        }
        return schema.notRequired();
      },
    ),

    fatherName: Yup.string().required('Father name is required'),
    dob: Yup.string().required('DOB is required'),
    aadharNumber: Yup.string()
      .required('Aadhar Number is required')
      .length(12, 'Aadhar must be 12 digits'),
    mobileNumber: Yup.string()
      .required('Mobile number is required')
      .length(10, 'Mobile number must be 10 digits'),
    selectedEducationalQualification: Yup.object({
      name: Yup.string().required('Educational Qualification is required'),
    }),
    selectedDepartment: Yup.object({
      name: Yup.string().required('Department is required'),
    }),
    selectedDesignation: Yup.object({
      name: Yup.string().required('Designation is required'),
    }),
    placeOfPosting: Yup.string().required('Place of posting is required'),
  });

  const handleNext = async () => {
    goNext();
    return;

    try {
      await generalSchema.validate(localForm, { abortEarly: false });
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
      const nextErrors: any = {};
      if (err?.inner?.length) {
        err.inner.forEach((e: any) => {
          if (!nextErrors[e.path]) nextErrors[e.path] = e.message;
        });
      } else if (err?.path) {
        nextErrors[err.path] = err.message;
      }
      setErrors(nextErrors);
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
        setValue('trainingNameList', Array.isArray(res.data) ? res.data : []);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
          autoHide: true,
        });
      });
  };

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const showPregnancyField =
    localForm.selectedGender?.name === 'Female' &&
    localForm.selectedMaritalStatus?.id === 'M';

  return (
    <View style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <FormFieldWrapper>
          <FormDropdownFieldWithTitle
            title="Training Center"
            isMandatory
            data={Array.isArray(trainingCenterList) ? trainingCenterList : []}
            value={localForm.selectedTrainingCenter}
            onChange={(item: any) => {
              setValue('selectedTrainingCenter', item);
              setValue('selectedTrainingName', {});
              setValue('trainingNameList', []);
              clearError('selectedTrainingCenter');
              clearError('selectedTrainingCenter.name');
              getAllTraining(item?.name);
            }}
            labelField="name"
            valueField="id"
            placeholder="Training Center"
            searchPlaceholder="Search Training Center"
            errorMessage={errors['selectedTrainingCenter.name']}
            disabled={tenantId !== 3}
          />

          <FormDropdownFieldWithTitle
            title="Training Name"
            isMandatory
            data={
              Array.isArray(localForm.trainingNameList)
                ? localForm.trainingNameList
                : []
            }
            value={localForm.selectedTrainingName}
            onChange={(item: any) => {
              setValue('selectedTrainingName', item);
              clearError('selectedTrainingName');
              clearError('selectedTrainingName.name');
            }}
            labelField="name"
            valueField="id"
            placeholder="Training Name"
            searchPlaceholder="Search Training Name"
            errorMessage={errors['selectedTrainingName.name']}
          />

          <FormTextInputWithTitle
            ref={input1_ref}
            title="Name"
            isMandatory
            value={localForm.name}
            onChangeText={(val: any) => {
              setValue('name', val);
              clearError('name');
            }}
            placeholder="Name"
            returnKeyType="next"
            onSubmitEditing={() => input2_ref.current?.focus?.()}
            autoCapitalize="none"
            errorMessage={errors.name}
          />

          <FormDropdownFieldWithTitle
            title="Gender"
            isMandatory
            data={Array.isArray(genderList) ? genderList : []}
            value={localForm.selectedGender}
            onChange={(item: any) => {
              setValue('selectedGender', item);
              setValue('selectedMaritalStatus', {});
              setValue('selectedPregnancyStatus', {});
              clearError('selectedGender');
              clearError('selectedGender.name');
            }}
            labelField="name"
            valueField="id"
            placeholder="Gender"
            searchPlaceholder="Search Gender"
            errorMessage={errors['selectedGender.name']}
          />

          <FormDropdownFieldWithTitle
            title="Marital Status"
            isMandatory
            data={Array.isArray(maritalStatusList) ? maritalStatusList : []}
            value={localForm.selectedMaritalStatus}
            onChange={(item: any) => {
              setValue('selectedMaritalStatus', item);
              if (item?.id !== 'M') {
                setValue('selectedPregnancyStatus', {});
              }
              clearError('selectedMaritalStatus');
              clearError('selectedMaritalStatus.name');
            }}
            labelField="name"
            valueField="id"
            placeholder="Marital Status"
            searchPlaceholder="Search Marital Status"
            errorMessage={errors['selectedMaritalStatus.name']}
          />

          {showPregnancyField && (
            <FormDropdownFieldWithTitle
              title="Pregnancy Status"
              isMandatory
              data={
                Array.isArray(pregnancyStatusList) ? pregnancyStatusList : []
              }
              value={localForm.selectedPregnancyStatus}
              onChange={(item: any) => {
                setValue('selectedPregnancyStatus', item);
                clearError('selectedPregnancyStatus');
                clearError('selectedPregnancyStatus.name');
              }}
              labelField="name"
              valueField="id"
              placeholder="Pregnancy Status"
              searchPlaceholder="Search Pregnancy Status"
              errorMessage={errors['selectedPregnancyStatus.name']}
            />
          )}

          <FormTextInputWithTitle
            ref={input2_ref}
            title="Father Name"
            isMandatory
            value={localForm.fatherName}
            onChangeText={(val: any) => {
              setValue('fatherName', val);
              clearError('fatherName');
            }}
            placeholder="Father Name"
            returnKeyType="next"
            onSubmitEditing={() => input3_ref.current?.focus?.()}
            autoCapitalize="none"
            errorMessage={errors.fatherName}
          />

          <DateInputOrganism
            label="DOB"
            placeholder="DOB"
            value={localForm.dob}
            onChangeText={(val: any) => {
              setValue('dob', val);
              clearError('dob');
            }}
            fieldName="date"
            dateFormat="DD-MM-YYYY"
            isMandatory
            errorMessage={errors.dob}
            maxDate={eighteenYearsAgo}
          />

          <FormTextInputWithTitle
            ref={input3_ref}
            title="Aadhar Number"
            isMandatory
            value={localForm.aadharNumber}
            onChangeText={(val: any) => {
              setValue('aadharNumber', normalizeNumber(val));
              clearError('aadharNumber');
            }}
            placeholder="Aadhar Number"
            returnKeyType="next"
            onSubmitEditing={() => input4_ref.current?.focus?.()}
            keyboardType="numeric"
            maxLength={12}
            autoCapitalize="none"
            errorMessage={errors.aadharNumber}
          />

          <FormTextInputWithTitle
            ref={input4_ref}
            title="Mobile Number"
            isMandatory
            value={localForm.mobileNumber}
            onChangeText={(val: any) => {
              setValue('mobileNumber', normalizeNumber(val));
              clearError('mobileNumber');
            }}
            placeholder="Mobile Number"
            returnKeyType="next"
            onSubmitEditing={() => input5_ref.current?.focus?.()}
            keyboardType="numeric"
            maxLength={10}
            autoCapitalize="none"
            errorMessage={errors.mobileNumber}
          />

          <FormDropdownFieldWithTitle
            title="Educational Qualification"
            isMandatory
            data={
              Array.isArray(educationalQualificationList)
                ? educationalQualificationList
                : []
            }
            value={localForm.selectedEducationalQualification}
            onChange={(item: any) => {
              setValue('selectedEducationalQualification', item);
              clearError('selectedEducationalQualification');
              clearError('selectedEducationalQualification.name');
            }}
            labelField="name"
            valueField="id"
            placeholder="Educational Qualification"
            searchPlaceholder="Search Educational Qualification"
            errorMessage={errors['selectedEducationalQualification.name']}
          />

          <FormDropdownFieldWithTitle
            title="Department"
            isMandatory
            data={Array.isArray(departmentList) ? departmentList : []}
            value={localForm.selectedDepartment}
            onChange={(item: any) => {
              setValue('selectedDepartment', item);
              clearError('selectedDepartment');
              clearError('selectedDepartment.name');
            }}
            labelField="name"
            valueField="id"
            placeholder="Department"
            searchPlaceholder="Search Department"
            errorMessage={errors['selectedDepartment.name']}
          />

          <FormDropdownFieldWithTitle
            title="Designation"
            isMandatory
            data={Array.isArray(designationList) ? designationList : []}
            value={localForm.selectedDesignation}
            onChange={(item: any) => {
              setValue('selectedDesignation', item);
              clearError('selectedDesignation');
              clearError('selectedDesignation.name');
            }}
            labelField="name"
            valueField="id"
            placeholder="Designation"
            searchPlaceholder="Search Designation"
            errorMessage={errors['selectedDesignation.name']}
          />

          <FormTextInputWithTitle
            ref={input5_ref}
            title="Place of Posting"
            isMandatory
            value={localForm.placeOfPosting}
            onChangeText={(val: any) => {
              setValue('placeOfPosting', val);
              clearError('placeOfPosting');
            }}
            placeholder="Place of Posting"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            autoCapitalize="none"
            errorMessage={errors.placeOfPosting}
          />
        </FormFieldWrapper>
        <FormGradientButton
          title="Next"
          onPress={handleNext}
          containerStyle={{ width: vw(328), marginBottom: vh(30) }}
        />
      </KeyboardAwareScrollView>
    </View>
  );
};

export default OtherRegistrationGeneral;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
    width: '100%',
  },
  contentScroll: {
    paddingHorizontal: vw(16),
    paddingBottom: vh(16),
    width: '100%',
  },
});
