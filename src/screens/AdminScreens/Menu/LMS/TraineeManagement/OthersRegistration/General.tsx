import { Keyboard, StyleSheet, Text, View } from 'react-native';
import React, { createRef, useState } from 'react';
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
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();

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

  const generalSchema = Yup.object().shape({
    placeOfPosting: Yup.string().required('Place of posting is required'),

    selectedDesignation: Yup.object({
      name: Yup.string().required('Designation is required'),
    }),

    selectedDepartment: Yup.object({
      name: Yup.string().required('Department is required'),
    }),

    selectedEducationalQualification: Yup.object({
      name: Yup.string().required('Qualification is required'),
    }),

    mobileNumber: Yup.string()
      .length(10, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),

    aadharNumber: Yup.string()
      .length(12, 'Aadhar must be 12 digits')
      .required('Aadhar Number is required'),

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
        selectedTrainingCenter,
        selectedTrainingName,
        name,
        selectedGender,
        selectedMaritalStatus,
        selectedPregnancyStatus,
        fatherName,
        dob,
        aadharNumber,
        mobileNumber,
        selectedEducationalQualification,
        selectedDepartment,
        selectedDesignation,
        placeOfPosting,
      });
      setErrors({});
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
        dispatch(saveTrainingNameList(res.data || []));
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
          label={'Training Center'}
          placeholder={'Training Center'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Center',
              Data: trainingCenterList,
              selectedData: selectedTrainingCenter,
              setSelectedData: (data: any) => {
                dispatch(saveSelectedTrainingCenter(data));
                dispatch(saveSelectedTrainingName({}));
                getAllTraining(data.name);
                setErrors({ ...errors, 'selectedTrainingCenter.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          isMandatory
          inputText={selectedTrainingCenter?.name}
          errorMessage={errors['selectedTrainingCenter.name']}
        />

        <DropDownOrganism
          label={'Training Name'}
          placeholder={'Training Name'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Training Name',
              Data: trainingNameList,
              selectedData: selectedTrainingName,
              setSelectedData: (data: any) => {
                dispatch(saveSelectedTrainingName(data));
                setErrors({ ...errors, 'selectedTrainingName.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          isMandatory
          inputText={selectedTrainingName?.name}
          errorMessage={errors['selectedTrainingName.name']}
        />
        <TextInputOrganisms
          label={'Name'}
          placeholder={'Name'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={name}
          onChangeText={(val: any) => {
            dispatch(saveName(val));
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
              selectedData: selectedGender,
              setSelectedData: (data: any) => {
                dispatch(saveSelectedGender(data));
                dispatch(saveSelectedMaritalStatus({}));
                setErrors({ ...errors, 'selectedGender.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={selectedGender?.name}
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
              selectedData: selectedMaritalStatus,
              setSelectedData: (data: any) => {
                dispatch(saveSelectedMaritalStatus(data));
                if (selectedMaritalStatus.id === 'U') {
                  dispatch(saveSelectedPregnancyStatus({}));
                }
                setErrors({ ...errors, 'selectedMaritalStatus.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={selectedMaritalStatus?.name}
          isMandatory
          errorMessage={errors['selectedMaritalStatus.name']}
        />

        {selectedGender?.name === 'Female' &&
          selectedMaritalStatus.id === 'M' && (
            <DropDownOrganism
              label={'Pregnancy Status'}
              placeholder={'Pregnancy Status'}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: 'Pregnancy Status',
                  Data: pregnancyStatusList,
                  selectedData: selectedPregnancyStatus,
                  setSelectedData: (data: any) => {
                    dispatch(saveSelectedPregnancyStatus(data));
                    setErrors({
                      ...errors,
                      'selectedPregnancyStatus.name': '',
                    });
                  },
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={selectedPregnancyStatus?.name}
              isMandatory
              errorMessage={errors['selectedPregnancyStatus.name']}
            />
          )}
        <TextInputOrganisms
          label={'Father Name'}
          placeholder={'Father Name'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={fatherName}
          onChangeText={(val: any) => {
            dispatch(saveFatherName(val));
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
          value={dob}
          onChangeText={(val: any) => {
            dispatch(saveDob(val));
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
          value={aadharNumber}
          onChangeText={(val: any) => {
            dispatch(saveAadharNumber(normalizeNumber(val)));
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
          value={mobileNumber}
          onChangeText={(val: any) => {
            dispatch(saveMobileNumber(normalizeNumber(val)));
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
              selectedData: selectedEducationalQualification,
              setSelectedData: (data: any) => {
                dispatch(saveSelectedEducationalQualification(data));
                setErrors({
                  ...errors,
                  'selectedEducationalQualification.name': '',
                });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={selectedEducationalQualification?.name}
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
              selectedData: selectedDepartment,
              setSelectedData: (data: any) => {
                dispatch(saveSelectedDepartment(data));
                setErrors({ ...errors, 'selectedDepartment.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={selectedDepartment?.name}
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
              selectedData: selectedDesignation,
              setSelectedData: (data: any) => {
                dispatch(saveSelectedDesignation(data));
                setErrors({ ...errors, 'selectedDesignation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={selectedDesignation?.name}
          isMandatory
          errorMessage={errors['selectedDesignation.name']}
        />

        <TextInputOrganisms
          label={'Place of Posting'}
          placeholder={'Place of Posting'}
          ref={input5_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={placeOfPosting}
          onChangeText={(val: any) => {
            dispatch(savePlaceOfPosting(val));
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
    </SafeAreaView>
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
