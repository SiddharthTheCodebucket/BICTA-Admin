import { StyleSheet, Keyboard } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { colors, screensName, vh, strings } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import TextInputOrganisms from '../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../components/organisms/DropDownOrganism';
import DateInputOrganism from '../../../../../components/organisms/DateInputOrganism';
import {
  aadharCardRegex,
  emailRegex,
  isNullUndefined,
  mobileRegex,
  normalizeLetters,
  normalizeLettersAndNumbers,
  normalizeNumber,
  panCardRegex,
  pinCodeRegex,
} from '../../../../../utils/CommonFunction';
import RadioSelectableOrganism from '../../../../../components/organisms/RadioSelectableOrganism';
import {
  useCommonDropdownListMutation,
  useUpdateTraineeDetailsMutation,
} from '../../../../../injectEndpointsTrainee/profileEndpoints';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import { useAppSelector } from '../../../../../hooks';
import ImageUploadOrganism from '../../../../../components/organisms/ImageUploadOrganism';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface Props {
  navigation: NavigationType;
}

const EditProfile = ({ navigation }: Props) => {
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();
  const input6_ref: any = createRef();
  const input7_ref: any = createRef();
  const input8_ref: any = createRef();
  const input9_ref: any = createRef();
  const input10_ref: any = createRef();
  const input11_ref: any = createRef();
  const input12_ref: any = createRef();
  const input13_ref: any = createRef();
  const input14_ref: any = createRef();
  const input15_ref: any = createRef();
  const input16_ref: any = createRef();
  const input17_ref: any = createRef();
  const input18_ref: any = createRef();
  const input19_ref: any = createRef();
  const input20_ref: any = createRef();
  const input21_ref: any = createRef();
  const input22_ref: any = createRef();
  const input23_ref: any = createRef();
  const input24_ref: any = createRef();
  const input25_ref: any = createRef();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.edit_profile);
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [updateTraineeDetailsApi] = useUpdateTraineeDetailsMutation();

  const { profileData } = useAppSelector(state => state.Profile);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    traineeId: '',
    trainingProgramName: '',
    name: '',
    courseDuration: '',
    aadhar: '',
    fatherName: '',
    motherName: '',
    gpf: '',
    pan: '',
    maritalStatus: {},
    gender: {},
    dob: '',
    officeEmail: '',
    otherEmail: '',
    designation: {},
    mobile: '',
    qualification: {},
    emergencyMobile: '',
    payScale: '',
    basicPay: '',
    category: {},
    officeAddress: '',
    officeDistrict: {},
    officePin: '',
    residentialAddress: '',
    residentialDistrict: {},
    residentialPin: '',
    dojDept: '',
    dojBipard: '',
    retirementDate: '',
    previousWorkExperience: {},
    previousworkExperienceDetails: '',
    computingCourse: {},
    computingCourseDetails: '',
    computingKnowledge: {},
    computingKnowledgeDetails: '',
    otherTraining: {},
    otherTrainingDetails: '',
    uploadPhotoFile: {},
    uploadSignFile: {},
    uploadAadharCardFile: {},
    photoUri: '',
    signUri: '',
    aadharCardUri: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [maritalStatusList, setMaritalStatusList] = useState<any>([]);
  const [genderList, setGenderList] = useState<any>([]);
  const [educationalQualificationList, setEducationalQualificationList] =
    useState<any>([]);
  const [desginationList, setDesginationList] = useState<any>([]);
  const [categoryList, setCategoryList] = useState<any>([]);
  const [districtList, setDistrictList] = useState<any>([]);

  useEffect(() => {
    getMaritalStatus();
    getGender();
    getEducationalQualification();
    getDesignation();
    getCaategory();
    getDistrict();
  }, []);

  const schema = Yup.object().shape({
    uploadAadharCardFile: Yup.object({
      uri: Yup.string().required(strings.aadhar_card_required),
    }),
    uploadSignFile:
      profileData.isBulkRegistration?.toLowerCase() === 'yes'
        ? Yup.object({
            uri: Yup.string().required(strings.sign_required),
          })
        : Yup.mixed().notRequired(),
    uploadPhotoFile:
      profileData.isBulkRegistration?.toLowerCase() === 'yes'
        ? Yup.object({
            uri: Yup.string().required(strings.photo_required),
          })
        : Yup.mixed().notRequired(),
    otherTrainingDetails:
      form.otherTraining.id === 1
        ? Yup.string().nullable().required(strings.details_is_required)
        : Yup.mixed().notRequired(),
    computingKnowledgeDetails:
      form.computingKnowledge.id === 1
        ? Yup.string().nullable().required(strings.details_is_required)
        : Yup.mixed().notRequired(),
    computingCourseDetails:
      form.computingCourse.id === 1
        ? Yup.string().nullable().required(strings.details_is_required)
        : Yup.mixed().notRequired(),
    previousworkExperienceDetails:
      form.previousWorkExperience.id === 1
        ? Yup.string()
            .nullable()
            .required(strings.work_experience_details_required)
        : Yup.mixed().notRequired(),
    retirementDate: Yup.string().required(strings.date_of_retirement_required),
    dojBipard: Yup.string().required(strings.doj_bipard_required),
    dojDept: Yup.string().required(strings.doj_department_required),
    residentialPin: Yup.string()
      .required(strings.residential_pin_required)
      .max(6, strings.enter_valid_residential_pin)
      .min(6, strings.enter_valid_residential_pin)
      .matches(pinCodeRegex, strings.enter_valid_residential_pin),
    residentialDistrict: Yup.object({
      name: Yup.string().required(strings.residential_district_required),
    }),
    residentialAddress: Yup.string().required(
      strings.residential_address_required,
    ),
    officePin: Yup.string()
      .required(strings.office_pin_required)
      .max(6, strings.enter_valid_office_pin)
      .min(6, strings.enter_valid_office_pin)
      .matches(pinCodeRegex, strings.enter_valid_office_pin),
    officeDistrict: Yup.object({
      name: Yup.string().required(strings.office_district_required),
    }),
    officeAddress: Yup.string().required(strings.office_address_required),
    category: Yup.object({
      name: Yup.string().required(strings.category_required),
    }),
    basicPay: Yup.string().required(strings.basic_pay_required),
    payScale: Yup.string().required(strings.pay_scale_required),

    emergencyMobile: Yup.string()
      .required(strings.emergency_mobile_required)
      .max(10, strings.enter_valid_emergency_mobile)
      .min(10, strings.enter_valid_emergency_mobile)
      .matches(mobileRegex, strings.enter_valid_emergency_mobile),
    qualification: Yup.object({
      name: Yup.string().required(strings.qualification_required),
    }),

    mobile: Yup.string()
      .required(strings.mobile_required)
      .max(10, strings.enter_valid_mobile)
      .min(10, strings.enter_valid_mobile)
      .matches(mobileRegex, strings.enter_valid_mobile),
    designation: Yup.object({
      name: Yup.string().required(strings.designation_required),
    }),
    officeEmail: Yup.string()
      .required(strings.office_email_required)
      .matches(emailRegex, strings.enter_valid_email),
    dob: Yup.string().required(strings.dob_required),
    gender: Yup.object({
      name: Yup.string().required(strings.gender_required),
    }),
    maritalStatus: Yup.object({
      name: Yup.string().required(strings.marital_status_required),
    }),
    pan: Yup.string()
      .required(strings.pan_required)
      .max(10, strings.pan_invalid)
      .min(10, strings.pan_invalid)
      .matches(panCardRegex, strings.pan_invalid),
    // gpf: Yup.string()
    //   .required('GPF/PRAN is required')
    //   .max(12, 'Enter The Correct GPf/PRAN')
    //   .min(10, 'Enter The Correct GPf/PRAN'),
    motherName: Yup.string().required(strings.mother_name_required),
    fatherName: Yup.string().required(strings.father_name_required),
    aadhar: Yup.string()
      .required(strings.aadhar_required)
      .max(12, strings.aadhar_invalid)
      .min(12, strings.aadhar_invalid)
      .matches(aadharCardRegex, strings.aadhar_invalid),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      updateTraineeDetails();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const setValue = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const getMaritalStatus = () => {
    const params = {
      listType: 'marital_status',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setMaritalStatusList(res.data);
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

  const getGender = () => {
    setLoader(true);
    const params = {
      listType: 'gender',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setGenderList(res.data);
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
  const getEducationalQualification = () => {
    setLoader(true);
    const params = {
      listType: 'trainee_education_qualification',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setEducationalQualificationList(res.data);
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
  const getDesignation = () => {
    setLoader(true);
    const params = {
      listType: 'trainee_designation',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setDesginationList(res.data);
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
  const getCaategory = () => {
    setLoader(true);
    const params = {
      listType: 'trainee_category',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setCategoryList(res.data);
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
  const getDistrict = () => {
    setLoader(true);
    const params = {
      listType: 'bihar_all_districts',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        const dropdownDistrict = res?.data?.map((item: any, index: any) => ({
          id: item.id,
          name: item.eName,
        }));
        setDistrictList(dropdownDistrict);
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

  const formatDate = (date: any) =>
    date ? moment(date, 'YYYY-MM-DD').format('DD-MM-YYYY') : '';

  const courseDuration = (s: any, e: any) =>
    s && e ? `${s} To ${e}` : s || e || '-';

  useEffect(() => {
    if (
      maritalStatusList.length &&
      genderList.length &&
      educationalQualificationList.length &&
      desginationList.length &&
      categoryList.length &&
      districtList.length &&
      profileData
    ) {
      setForm((prev: any) => ({
        ...prev,

        traineeId: profileData.traineeId + '',
        trainingProgramName: profileData.nameOfTrainingProgramme ?? '',
        name: profileData.name ?? '',
        courseDuration:
          courseDuration(
            profileData?.courseStartDate,
            profileData?.courseEndDate,
          ) ?? '',
        aadhar: profileData.aadhaarNo ?? '',
        fatherName: profileData.fatherName ?? '',
        motherName: profileData.motherName ?? '',
        gpf: profileData.gpfOrPran ?? '',
        pan: profileData.panNo ?? '',
        maritalStatus:
          maritalStatusList.find(
            (x: any) => x.id == profileData.maritalStatusId,
          ) || {},
        gender: genderList.find((x: any) => x.id == profileData.genderId) || {},
        dob: moment(profileData.dob, 'YYYY-MM-DD').format('DD-MM-YYYY') ?? '',

        officeEmail: profileData.officeEmail ?? '',
        otherEmail: profileData.otherEmail ?? '',

        designation:
          desginationList.find((x: any) => x.id == profileData.designationId) ||
          {},
        mobile: profileData.mobileNo ?? '',

        qualification:
          educationalQualificationList.find(
            (x: any) => x.id == profileData.educationQualificationId,
          ) || {},
        emergencyMobile: profileData.emergencyContactNumber ?? '',
        payScale: String(profileData?.payScale ?? ''),
        basicPay: String(profileData?.basicPayScale ?? ''),

        category:
          categoryList.find((x: any) => x.id == profileData.categoryId) || {},
        officeAddress: profileData.officeAddress ?? '',
        officeDistrict:
          districtList.find((x: any) => x.id == profileData.officeDistrictId) ||
          {},

        officePin: profileData.officePincode ?? '',
        residentialAddress: profileData.residentialAddress ?? '',

        residentialDistrict:
          districtList.find(
            (x: any) => x.id == profileData.residentialDistrictId,
          ) || {},
        residentialPin: profileData.residentialPincode ?? '',

        dojDept: formatDate(profileData?.dateOfJoiningDepartment),
        dojBipard: formatDate(profileData?.dateOfJoiningBipard),
        retirementDate: formatDate(profileData?.dateOfRetirement),

        previousWorkExperience:
          profileData?.previousWorkExperience?.toLowerCase() === 'yes'
            ? { id: 1, value: 'Yes' }
            : (() => {
                if (
                  profileData?.previousWorkExperience?.toLowerCase() === 'no'
                ) {
                  return { id: 2, value: 'No' };
                }
                return {};
              })(),
        previousworkExperienceDetails:
          profileData.previousWorkExperienceText ?? '',

        computingCourse:
          profileData?.attendedOrCompletedAnyOtherTraining?.toLowerCase() ===
          'yes'
            ? { id: 1, value: 'Yes' }
            : (() => {
                if (
                  profileData?.attendedOrCompletedAnyOtherTraining?.toLowerCase() ===
                  'no'
                ) {
                  return { id: 2, value: 'No' };
                }
                return {};
              })(),
        computingCourseDetails: profileData.otherTrainingText ?? '',

        computingKnowledge:
          profileData.knowledgeOfComputing?.toLowerCase() === 'yes'
            ? { id: 1, value: 'Yes' }
            : (() => {
                if (profileData.knowledgeOfComputing?.toLowerCase() === 'no') {
                  return { id: 2, value: 'No' };
                }
                return {};
              })(),
        computingKnowledgeDetails: profileData.knowledgeOfComputingText ?? '',

        otherTraining:
          profileData.attendedOrCompleted?.toLowerCase() === 'yes'
            ? { id: 1, value: 'Yes' }
            : (() => {
                if (profileData.attendedOrCompleted?.toLowerCase() === 'no') {
                  return { id: 2, value: 'No' };
                }
                return {};
              })(),
        otherTrainingDetails: profileData.attendedOrCompletedText ?? '',

        photoUri: profileData.photo ?? '',
        signUri: profileData.sign ?? '',
        aadharCardUri: profileData.aadhaarCard ?? '',

        uploadPhotoFile: profileData.photo
          ? {
              uri: profileData.photo,
              fileName: 'photo.jpg',
              type: 'image/jpeg',
            }
          : {},

        uploadSignFile: profileData.sign
          ? {
              uri: profileData.sign,
              fileName: 'sign.jpg',
              type: 'image/jpeg',
            }
          : {},

        uploadAadharCardFile: profileData.aadhaarCard
          ? {
              uri: profileData.aadhaarCard,
              fileName: 'aadhar.jpg',
              type: 'image/jpeg',
            }
          : {},
      }));
    }
  }, [
    maritalStatusList,
    genderList,
    educationalQualificationList,
    desginationList,
    categoryList,
    districtList,
    profileData,
  ]);

  const updateTraineeDetails = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append('traineeId', form.traineeId);
    formData.append('nameOfTrainingProgramme', form.trainingProgramName);
    formData.append('courseDuration', form.courseDuration);
    formData.append('name', form.name);
    formData.append('aadhaarNo', form.aadhar);
    formData.append('fatherName', form.fatherName);
    formData.append('motherName', form.motherName);
    formData.append('gpfOrPran', form.gpf);
    formData.append('panNo', form.pan);
    formData.append('maritalStatus', form.maritalStatus?.name || null);
    formData.append('maritalStatusId', form.maritalStatus?.id || null);
    formData.append('gender', form.gender?.id || null);
    formData.append('dob', moment(form.dob, 'DD-MM-YYYY').format('YYYY-MM-DD'));
    formData.append('officeEmail', form.officeEmail);
    formData.append('otherEmail', form.otherEmail);
    formData.append('designation', form.designation?.id || null);
    formData.append('mobileNo', form.mobile);
    formData.append('educationQualification', form.qualification?.id || null);
    formData.append('emergencyContactNumber', form.emergencyMobile);
    formData.append('payScale', form.payScale);
    formData.append('basicPayScale', form.basicPay);
    formData.append('category', form.category?.id || null);
    formData.append('officeAddress', form.officeAddress);
    formData.append('officeDistrict', form.officeDistrict?.id || null);
    formData.append('officePincode', form.officePin);
    formData.append('residentialAddress', form.residentialAddress);
    formData.append(
      'residentialDistrict',
      form.residentialDistrict?.id || null,
    );
    formData.append('residentialPincode', form.residentialPin);
    formData.append(
      'dateOfJoiningDepartment',
      moment(form.dojDept, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append(
      'dateOfJoiningBipard',
      moment(form.dojBipard, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formData.append(
      'dateOfRetirement',
      moment(form.retirementDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );

    formData.append(
      'previousWorkExperience',
      form.previousWorkExperience?.value || '',
    );
    formData.append(
      'previousWorkExperienceText',
      form.previousworkExperienceDetails,
    );
    formData.append(
      'attendedOrCompletedAnyOtherTraining',
      form.computingCourse?.value || '',
    );
    formData.append('otherTrainingText', form.computingCourseDetails);
    formData.append(
      'knowledgeOfComputing',
      form.computingKnowledge?.value || '',
    );

    formData.append('knowledgeOfComputingText', form.computingKnowledgeDetails);
    formData.append('attendedOrCompleted', form.otherTraining?.value || '');
    formData.append('attendedOrCompletedText', form.otherTrainingDetails);
    if (
      form.uploadPhotoFile &&
      profileData.isBulkRegistration?.toLowerCase() !== 'no'
    ) {
      formData.append('photo', {
        uri: form.uploadPhotoFile.uri,
        name: form.uploadPhotoFile.fileName,
        type: form.uploadPhotoFile.type,
      });
    }

    if (
      form.uploadSignFile &&
      profileData.isBulkRegistration?.toLowerCase() !== 'no'
    ) {
      formData.append('sign', {
        uri: form.uploadSignFile.uri,
        name: form.uploadSignFile.fileName,
        type: form.uploadSignFile.type,
      });
    }

    if (form.uploadAadharCardFile) {
      formData.append('aadhaarCard', {
        uri: form.uploadAadharCardFile.uri,
        name: form.uploadAadharCardFile.fileName,
        type: form.uploadAadharCardFile.type,
      });
    }

    updateTraineeDetailsApi(formData)
      .unwrap()
      .then((res: any) => {
        if (
          profileData.isTraineeIndemnityBondSubmitted?.toLowerCase() === 'no'
        ) {
          navigation.navigate(screensName.IndemnityBondForm);
        } else {
          navigation.navigate(screensName.MyProfile);
        }

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
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <TextInputOrganisms
          label={strings.trainee_id}
          placeholder={strings.trainee_id}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={form.traineeId}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('traineeId', val);
          }}
          disabled
          editable={false}
        />
        <TextInputOrganisms
          label={strings.name_of_training_programme}
          placeholder={strings.name_of_training_programme}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.trainingProgramName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('trainingProgramName', val);
          }}
          disabled
          editable={false}
        />
        <TextInputOrganisms
          label={strings.name}
          placeholder={strings.name}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.name}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('name', val);
          }}
          disabled
          editable={false}
        />
        <TextInputOrganisms
          label={strings.course_duration}
          placeholder={strings.course_duration}
          ref={input4_ref}
          onSubmitEditing={() => input5_ref.current.focus()}
          value={form.courseDuration}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('courseDuration', val);
          }}
          disabled
          editable={false}
        />
        <TextInputOrganisms
          label={strings.aadhaar_no}
          placeholder={strings.aadhaar_no}
          ref={input6_ref}
          onSubmitEditing={() => input7_ref.current.focus()}
          value={form.aadhar}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('aadhar', formattedInput);
            setErrors({ ...errors, aadhar: '' });
          }}
          errorMessage={errors.aadhar}
          isMandatory
          maxLength={12}
          keyboardType="numeric"
        />
        <TextInputOrganisms
          label={strings.father_name}
          placeholder={strings.father_name}
          ref={input7_ref}
          onSubmitEditing={() => input8_ref.current.focus()}
          value={form.fatherName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeLetters(val);
            setValue('fatherName', formattedInput);
            setErrors({ ...errors, fatherName: '' });
          }}
          isMandatory
          errorMessage={errors.fatherName}
        />
        <TextInputOrganisms
          label={strings.mother_name}
          placeholder={strings.mother_name}
          ref={input8_ref}
          onSubmitEditing={() => input9_ref.current.focus()}
          value={form.motherName}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeLetters(val);
            setValue('motherName', formattedInput);
            setErrors({ ...errors, motherName: '' });
          }}
          isMandatory
          errorMessage={errors.motherName}
        />
        <TextInputOrganisms
          label={strings.gpf_pran}
          placeholder={strings.gpf_pran}
          ref={input9_ref}
          onSubmitEditing={() => input10_ref.current.focus()}
          value={form.gpf}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeLettersAndNumbers(val)?.toUpperCase();
            setValue('gpf', formattedInput);
            setErrors({ ...errors, gpf: '' });
          }}
          // isMandatory
          // errorMessage={errors.gpf}
          maxLength={12}
        />
        <TextInputOrganisms
          label={strings.pan_no}
          placeholder={strings.pan_no}
          ref={input10_ref}
          onSubmitEditing={() => input11_ref.current.focus()}
          value={form.pan}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeLettersAndNumbers(val)?.toUpperCase();
            setValue('pan', formattedInput);
            setErrors({ ...errors, pan: '' });
          }}
          isMandatory
          errorMessage={errors.pan}
          maxLength={10}
        />

        <DropDownOrganism
          label={strings.marital_status}
          placeholder={strings.marital_status}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Marital Status',
              Data: maritalStatusList,
              selectedData: form.maritalStatus,
              setSelectedData: (data: any) => {
                setValue('maritalStatus', data);
                setErrors({ ...errors, 'maritalStatus.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.maritalStatus?.name}
          isMandatory
          errorMessage={errors['maritalStatus.name']}
        />
        <DropDownOrganism
          label={strings.gender}
          placeholder={strings.gender}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Gender',
              Data: genderList,
              selectedData: form.gender,
              setSelectedData: (data: any) => {
                setValue('gender', data);
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
        <DateInputOrganism
          label={strings.date_of_birth}
          placeholder={strings.date_of_birth}
          value={form.dob}
          onChangeText={(val: any) => {
            setValue('dob', val);
            setErrors({ ...errors, dob: '' });
          }}
          isMandatory
          fieldName={'date'}
          errorMessage={errors.dob}
          dateFormat="DD-MM-YYYY"
          maxDate={new Date()}
        />
        <TextInputOrganisms
          label={strings.office_email}
          placeholder={strings.office_email}
          ref={input12_ref}
          onSubmitEditing={() => input13_ref.current.focus()}
          value={form.officeEmail}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('officeEmail', val);
            setErrors({ ...errors, officeEmail: '' });
          }}
          isMandatory
          errorMessage={errors.officeEmail}
          disabled={!isNullUndefined(form.officeEmail)}
          editable={isNullUndefined(form.officeEmail)}
        />
        <TextInputOrganisms
          label={strings.other_email}
          placeholder={strings.other_email}
          ref={input13_ref}
          onSubmitEditing={() => input14_ref.current.focus()}
          value={form.otherEmail}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('otherEmail', val);
          }}
        />
        <DropDownOrganism
          label={strings.designation}
          placeholder={strings.designation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Designation',
              Data: desginationList,
              selectedData: form.designation,
              setSelectedData: (data: any) => {
                setValue('designation', data);
                setErrors({ ...errors, 'designation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.designation?.name}
          isMandatory
          errorMessage={errors['designation.name']}
        />
        <TextInputOrganisms
          label={strings.mobile_no}
          placeholder={strings.mobile_no}
          ref={input14_ref}
          onSubmitEditing={() => input15_ref.current.focus()}
          value={form.mobile}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('mobile', formattedInput);
            setErrors({ ...errors, mobile: '' });
          }}
          isMandatory
          errorMessage={errors.mobile}
          maxLength={10}
          keyboardType="numeric"
          disabled={!isNullUndefined(form.mobile)}
          editable={isNullUndefined(form.mobile)}
        />
        <DropDownOrganism
          label={strings.educational_qualification}
          placeholder={strings.educational_qualification}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Educational Qualification',
              Data: educationalQualificationList,
              selectedData: form.qualification,
              setSelectedData: (data: any) => {
                setValue('qualification', data);
                setErrors({ ...errors, 'qualification.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.qualification?.name}
          errorMessage={errors['qualification.name']}
          isMandatory
        />
        <TextInputOrganisms
          label={strings.emergency_mobile}
          placeholder={strings.emergency_mobile}
          ref={input15_ref}
          onSubmitEditing={() => input16_ref.current.focus()}
          value={form.emergencyMobile}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('emergencyMobile', formattedInput);
            setErrors({ ...errors, emergencyMobile: '' });
          }}
          isMandatory
          errorMessage={errors.emergencyMobile}
          maxLength={10}
          keyboardType="numeric"
        />
        <TextInputOrganisms
          label={strings.pay_scale}
          placeholder={strings.pay_scale}
          ref={input16_ref}
          onSubmitEditing={() => input17_ref.current.focus()}
          value={form.payScale}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('payScale', formattedInput);
            setErrors({ ...errors, payScale: '' });
          }}
          isMandatory
          errorMessage={errors.payScale}
          keyboardType="numeric"
        />
        <TextInputOrganisms
          label={strings.basic_pay_scale}
          placeholder={strings.basic_pay_scale}
          ref={input17_ref}
          onSubmitEditing={() => input18_ref.current.focus()}
          value={form.basicPay}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('basicPay', formattedInput);
            setErrors({ ...errors, basicPay: '' });
          }}
          isMandatory
          errorMessage={errors.basicPay}
          keyboardType="numeric"
        />
        <DropDownOrganism
          label={strings.category}
          placeholder={strings.category}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Category',
              Data: categoryList,
              selectedData: form.category,
              setSelectedData: (data: any) => {
                setValue('category', data);
                setErrors({ ...errors, 'category.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.category?.name}
          errorMessage={errors['category.name']}
          isMandatory
        />
        <TextInputOrganisms
          label={strings.office_address}
          placeholder={strings.office_address}
          ref={input18_ref}
          onSubmitEditing={() => input19_ref.current.focus()}
          value={form.officeAddress}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('officeAddress', val);
            setErrors({ ...errors, officeAddress: '' });
          }}
          isMandatory
          errorMessage={errors.officeAddress}
        />
        <DropDownOrganism
          label={strings.office_district}
          placeholder={strings.office_district}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Office District',
              Data: districtList,
              selectedData: form.officeDistrict,
              setSelectedData: (data: any) => {
                setValue('officeDistrict', data);
                setErrors({ ...errors, 'officeDistrict.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.officeDistrict?.name}
          errorMessage={errors['officeDistrict.name']}
          isMandatory
        />
        <TextInputOrganisms
          label={strings.office_pin_code}
          placeholder={strings.office_pin_code}
          ref={input19_ref}
          onSubmitEditing={() => input20_ref.current.focus()}
          value={form.officePin}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('officePin', formattedInput);
            setErrors({ ...errors, officePin: '' });
          }}
          isMandatory
          errorMessage={errors.officePin}
          maxLength={6}
          keyboardType="numeric"
        />
        <TextInputOrganisms
          label={strings.residential_address}
          placeholder={strings.residential_address}
          ref={input20_ref}
          onSubmitEditing={() => input21_ref.current.focus()}
          value={form.residentialAddress}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('residentialAddress', val);
            setErrors({ ...errors, residentialAddress: '' });
          }}
          isMandatory
          errorMessage={errors.residentialAddress}
        />
        <DropDownOrganism
          label={strings.residential_district}
          placeholder={strings.residential_district}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Residential District',
              Data: districtList,
              selectedData: form.residentialDistrict,
              setSelectedData: (data: any) => {
                setValue('residentialDistrict', data);
                setErrors({ ...errors, 'residentialDistrict.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.residentialDistrict?.name}
          errorMessage={errors['residentialDistrict.name']}
          isMandatory
        />
        <TextInputOrganisms
          label={strings.residential_pin_code}
          placeholder={strings.residential_pin_code}
          ref={input21_ref}
          onSubmitEditing={() => input22_ref.current.focus()}
          value={form.residentialPin}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            let formattedInput = normalizeNumber(val);
            setValue('residentialPin', formattedInput);
            setErrors({ ...errors, residentialPin: '' });
          }}
          isMandatory
          errorMessage={errors.residentialPin}
          maxLength={6}
          keyboardType="numeric"
        />
        <DateInputOrganism
          label={strings.doj_department}
          placeholder={strings.doj_department}
          value={form.dojDept}
          onChangeText={(val: any) => {
            setValue('dojDept', val);
            setErrors({ ...errors, dojDept: '' });
          }}
          isMandatory
          fieldName={'date'}
          errorMessage={errors.dojDept}
          dateFormat="DD-MM-YYYY"
          maxDate={new Date()}
        />
        <DateInputOrganism
          label={strings.doj_bipard}
          placeholder={strings.doj_bipard}
          value={form.dojBipard}
          onChangeText={(val: any) => {
            setValue('dojBipard', val);
            setErrors({ ...errors, dojBipard: '' });
          }}
          isMandatory
          fieldName={'date'}
          errorMessage={errors.dojBipard}
          dateFormat="DD-MM-YYYY"
          maxDate={new Date()}
        />
        <DateInputOrganism
          label={strings.date_of_retirement}
          placeholder={strings.date_of_retirement}
          value={form.retirementDate}
          onChangeText={(val: any) => {
            setValue('retirementDate', val);
            setErrors({ ...errors, retirementDate: '' });
          }}
          isMandatory
          fieldName={'date'}
          errorMessage={errors.retirementDate}
          dateFormat="DD-MM-YYYY"
        />

        <RadioSelectableOrganism
          data={[
            { id: 1, value: 'Yes' },
            { id: 2, value: 'No' },
          ]}
          onSelect={(item: any) => {
            setValue('previousWorkExperience', item);
          }}
          label={strings.previous_work_experience}
          selectedType={form.previousWorkExperience}
          typeName={'value'}
          typeId={'id'}
          isMandatory={false}
        />
        {form.previousWorkExperience?.id === 1 && (
          <TextInputOrganisms
            label={strings.work_experience_details}
            placeholder={strings.work_experience_details}
            ref={input22_ref}
            onSubmitEditing={() => input23_ref.current.focus()}
            value={form.previousworkExperienceDetails}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              if (form.previousWorkExperience?.id === 1) {
                setValue('previousworkExperienceDetails', val);
                setErrors({ ...errors, previousworkExperienceDetails: '' });
              } else {
                setValue('previousworkExperienceDetails', '');
                setErrors({ ...errors, previousworkExperienceDetails: '' });
              }
            }}
            isMandatory
            errorMessage={errors.previousworkExperienceDetails}
          />
        )}

        <RadioSelectableOrganism
          data={[
            { id: 1, value: 'Yes' },
            { id: 2, value: 'No' },
          ]}
          onSelect={(item: any) => {
            setValue('computingCourse', item);
          }}
          label={strings.computing_course_label}
          selectedType={form.computingCourse}
          typeName={'value'}
          typeId={'id'}
          isMandatory={false}
        />
        {form.computingCourse?.id === 1 && (
          <TextInputOrganisms
            label={strings.enter_details}
            placeholder={strings.enter_details}
            ref={input23_ref}
            onSubmitEditing={() => input24_ref.current.focus()}
            value={form.computingCourseDetails}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              if (form.computingCourse?.id === 1) {
                setValue('computingCourseDetails', val);
                setErrors({ ...errors, computingCourseDetails: '' });
              } else {
                setValue('computingCourseDetails', '');
                setErrors({ ...errors, computingCourseDetails: '' });
              }
            }}
            isMandatory
            errorMessage={errors.computingCourseDetails}
          />
        )}
        <RadioSelectableOrganism
          data={[
            { id: 1, value: 'Yes' },
            { id: 2, value: 'No' },
          ]}
          onSelect={(item: any) => {
            setValue('computingKnowledge', item);
          }}
          label={strings.knowledge_of_computing_label}
          selectedType={form.computingKnowledge}
          typeName={'value'}
          typeId={'id'}
          isMandatory={false}
        />
        {form.computingKnowledge?.id === 1 && (
          <TextInputOrganisms
            label={strings.enter_details}
            placeholder={strings.enter_details}
            ref={input24_ref}
            onSubmitEditing={() => input25_ref.current.focus()}
            value={form.computingKnowledgeDetails}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              if (form.computingKnowledge?.id === 1) {
                setValue('computingKnowledgeDetails', val);
                setErrors({ ...errors, computingKnowledgeDetails: '' });
              } else {
                setValue('computingKnowledgeDetails', '');
                setErrors({ ...errors, computingKnowledgeDetails: '' });
              }
            }}
            isMandatory
            errorMessage={errors.computingKnowledgeDetails}
          />
        )}
        <RadioSelectableOrganism
          data={[
            { id: 1, value: 'Yes' },
            { id: 2, value: 'No' },
          ]}
          onSelect={(item: any) => {
            setValue('otherTraining', item);
          }}
          label={strings.other_training_label}
          selectedType={form.otherTraining}
          typeName={'value'}
          typeId={'id'}
          isMandatory={false}
        />
        {form.otherTraining?.id === 1 && (
          <TextInputOrganisms
            label={strings.enter_details}
            placeholder={strings.enter_details}
            ref={input25_ref}
            onSubmitEditing={() => Keyboard.dismiss()}
            value={form.otherTrainingDetails}
            autoCapitalize={'none'}
            returnKeyType={'done'}
            onChangeText={(val: string) => {
              if (form.otherTraining?.id === 1) {
                setValue('otherTrainingDetails', val);
                setErrors({ ...errors, otherTrainingDetails: '' });
              } else {
                setValue('otherTrainingDetails', '');
                setErrors({ ...errors, otherTrainingDetails: '' });
              }
            }}
            isMandatory
            errorMessage={errors.otherTrainingDetails}
          />
        )}

        {profileData.isBulkRegistration?.toLowerCase() !== 'no' && (
          <>
            <ImageUploadOrganism
              label={strings.upload_photo}
              isMandatory
              buttonText="Choose File"
              onSelectImage={(file: any) => {
                setValue('uploadPhotoFile', file);
                setErrors({ ...errors, 'uploadPhotoFile.uri': '' });
              }}
              defaultImage={form.photoUri}
              errorMessage={errors['uploadPhotoFile.uri']}
            />
            <ImageUploadOrganism
              label={strings.upload_signature}
              isMandatory
              buttonText="Choose File"
              onSelectImage={(file: any) => {
                setValue('uploadSignFile', file);
                setErrors({ ...errors, 'uploadSignFile.uri': '' });
              }}
              defaultImage={form.signUri}
              errorMessage={errors['uploadSignFile.uri']}
            />
          </>
        )}
        <ImageUploadOrganism
          label={strings.upload_aadhar_card}
          isMandatory
          buttonText="Choose File"
          onSelectImage={(file: any) => {
            setValue('uploadAadharCardFile', file);
            setErrors({ ...errors, 'uploadAadharCardFile.uri': '' });
          }}
          defaultImage={form.aadharCardUri}
          note={strings.aadhar_merge_note}
          errorMessage={errors['uploadAadharCardFile.uri']}
        />
      </KeyboardAwareScrollView>

      <ButtonOrganism bttnText={strings.submit} onPress={onSubmit} />
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: vh(20),
  },
  scrollView: {
    flex: 1,
  },
});
