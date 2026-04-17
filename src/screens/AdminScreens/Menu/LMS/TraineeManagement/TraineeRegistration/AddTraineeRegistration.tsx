import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { pick } from '@react-native-documents/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  colors,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { isNullUndefined } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import {
  FormGradientButton,
  FormStepper,
  FormWhiteButton,
} from '../../../../../../components/templates';
import {
  useAddTraineeRegistrationBulkMutation,
  useAddTraineeRegistrationMutation,
  useUpdateTraineeRegistrationMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { useAppSelector } from '../../../../../../hooks';
import AddTraineeRegistration_1 from './AddTraineeRegistration_1';
import AddTraineeRegistration_2 from './AddTraineeRegistration_2';
import AddTraineeRegistration_3 from './AddTraineeRegistration_3';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddTraineeRegistration = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const [otpTimer, setOtpTimer] = useState(0);
  const [currentStep, setCurrentStep] = useState(3);
  const steps = ['Personal info', 'Uploads', 'Verify'];

  const [commonDropdownListApi] = useCommonDropdownListMutation();

  const [addTraineeRegistrationBulkApi] =
    useAddTraineeRegistrationBulkMutation();
  const [addTraineeRegistrationApi] = useAddTraineeRegistrationMutation();
  const [updateTraineeRegistrationApi] = useUpdateTraineeRegistrationMutation();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;

  const navigateToRegistrationList = () => {
    navigation.navigate(screensName.TraineeManagement, {
      initialTab: 'TraineeRegistration',
    });
  };

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Trainee' : 'Edit Trainee',
    );
    navigation.BackButtonPress = () => navigateToRegistrationList();
  }, [navigation, item]);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    registrationTypeList: [
      { id: 'Bulk Upload', name: 'Bulk Upload' },
      { id: 'Manual Upload', name: 'Manual Upload' },
    ],
    selectedRegistration: { id: 'Manual Upload', name: 'Manual Upload' },
    isAlereadyRegistredList: [
      { id: 'Yes', name: 'Yes' },
      { id: 'No', name: 'No' },
    ],
    selectedIsAlereadyRegistred: { id: 'No', name: 'No' },
    trainingCenterList: [],
    selectedTrainingCenter: {},
    trainingNameList: [],
    selectedTrainingName: {},
    batchNumberList: [],
    selectedBatchList: {},
    departmentList: [],
    selectedDepartmentList: {},
    name: '',
    designationList: [],
    selectedDesignation: {},
    placeOfPosting: '',
    genderList: [],
    selectedGender: {},
    dob: '',
    aadharNumber: '',
    officeEmail: '',
    mobileNumber: '',
    bloodGroupList: [],
    selectedBloodGroup: {},
    photo: {},
    signature: {},
    otp: '',
    excelFile: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    getTrainingCenter();
  }, []);

  // Auto-select training center and trigger APIs when list is loaded
  useEffect(() => {
    if (item) return; // Skip auto-selection for edit mode
    if (form.trainingCenterList.length === 0) return;
    if (form.selectedTrainingCenter?.id) return; // Already selected

    let autoSelectedCenter = null;
    if (tenantId === 1) {
      autoSelectedCenter = form.trainingCenterList.find(
        (x: any) => x.name === 'Gaya',
      );
    } else if (tenantId === 2) {
      autoSelectedCenter = form.trainingCenterList.find(
        (x: any) => x.name === 'Patna',
      );
    }

    if (autoSelectedCenter) {
      setValue('selectedTrainingCenter', autoSelectedCenter);
      // Trigger dependent API calls
      getGender(autoSelectedCenter.name);
      getDepartment(autoSelectedCenter.name);
      getTraineeDesignation(autoSelectedCenter.name);
      getBloodGroup(autoSelectedCenter.name);
      getTrainingName(autoSelectedCenter.name);
    }
  }, [form.trainingCenterList, tenantId]);

  useEffect(() => {
    if (!item) return;
    if (form.trainingCenterList.length === 0) return;

    prefillStage1();
  }, [item, form.trainingCenterList]);

  const prefillStage1 = async () => {
    const selectedTC = form.trainingCenterList.find(
      (x: any) => x.name === item.trainingCentre,
    );
    if (!selectedTC) return;

    setValue('selectedTrainingCenter', selectedTC);

    await Promise.all([
      getGender(selectedTC.name),
      getDepartment(selectedTC.name),
      getTraineeDesignation(selectedTC.name),
      getBloodGroup(selectedTC.name),
      getTrainingName(selectedTC.name),
    ]);
  };

  useEffect(() => {
    if (!item) return;

    if (
      form.genderList.length &&
      form.departmentList.length &&
      form.designationList.length &&
      form.bloodGroupList.length &&
      form.trainingNameList.length
    ) {
      prefillStage2();
    }
  }, [
    form.genderList,
    form.departmentList,
    form.designationList,
    form.bloodGroupList,
    form.trainingNameList,
  ]);

  const prefillStage2 = async () => {
    const manualType =
      item.aadhaarNo && item.photo && item.sign && item.dob ? 'No' : 'Yes';

    setValue('selectedRegistration', {
      id: 'Manual Upload',
      name: 'Manual Upload',
    });
    setValue('selectedIsAlereadyRegistred', {
      id: manualType,
      name: manualType,
    });

    const training = form.trainingNameList.find(
      (x: any) => x.id == item.nameOfTrainingProgrammeId,
    );
    setValue('selectedTrainingName', training);

    getTrainingBatchNo(training.id);
    const batch = form.batchNumberList.find((x: any) => x.id == item.batchNoId);
    setValue('selectedBatchList', batch);

    setValue(
      'selectedDesignation',
      form.designationList.find((x: any) => x.name === item.designation),
    );

    setValue(
      'selectedDepartmentList',
      form.departmentList.find((x: any) => x.id === item.departmentId) || {},
    );

    // Gender
    setValue(
      'selectedGender',
      form.genderList.find((x: any) => x.name === item.gender),
    );

    // Blood group
    setValue(
      'selectedBloodGroup',
      form.bloodGroupList.find((x: any) => x.id === item.bloodGroupId),
    );

    // Basic fields
    setForm((prev: any) => ({
      ...prev,
      name: item.name,
      dob: moment(item.dob).format('DD-MM-YYYY'),
      aadharNumber: item.aadhaarNo,
      officeEmail: item.officeEmail,
      mobileNumber: item.mobileNo,
      placeOfPosting: item.placeOfPosting || '',
      photo: { uri: item.photo },
      signature: { uri: item.sign },
    }));
  };

  // 🚀 Fix for batch + department
  useEffect(() => {
    if (!item) return;

    // Batch Fix
    if (
      form.trainingNameList.length > 0 &&
      form.batchNumberList.length > 0 &&
      item.batchNoId
    ) {
      const batch = form.batchNumberList.find(
        (x: any) => x.id == item.batchNoId,
      );
      if (batch) {
        setValue('selectedBatchList', batch);
      }
    }

    if (form.departmentList.length > 0 && item.departmentId) {
      const dept = form.departmentList.find(
        (x: any) => x.id == item.departmentId,
      );
      if (dept) {
        setValue('selectedDepartmentList', dept);
      }
    }
  }, [form.batchNumberList, form.departmentList]);

  const isBulk = form.selectedRegistration?.id === 'Bulk Upload';
  const isManual = form.selectedRegistration?.id === 'Manual Upload';
  const isYes = form.selectedIsAlereadyRegistred?.id === 'Yes';
  const isNo = form.selectedIsAlereadyRegistred?.id === 'No';

  const show = {
    trainingCenter: isBulk || isManual,
    trainingName: isBulk || isManual,
    batch: isBulk || (isManual && isNo),
    department: isBulk || (isManual && isNo),

    name: isManual,
    designation: isManual,
    posting: isManual,
    gender: isManual,
    email: isManual,
    otp: isManual,

    dob: isManual && isNo,
    aadhar: isManual && isNo,
    mobile: isManual && isNo,
    blood: isManual && isNo,
    photo: isManual && isNo,
    signature: isManual && isNo,

    excelFile: isBulk,
  };

  const bulkSchema = Yup.object().shape({
    excelFile: Yup.object({
      uri: Yup.string().required('Excel file required'),
    }),
    selectedDepartmentList: Yup.object({
      name: Yup.string().required('Department is required'),
    }),
    selectedBatchList: Yup.object({
      name: Yup.string().required('Batch is required'),
    }),
    selectedTrainingName: Yup.object({
      name: Yup.string().required('Training name is required'),
    }),
    selectedTrainingCenter: Yup.object({
      name: Yup.string().required('Training center is required'),
    }),
    selectedRegistration: Yup.object({
      name: Yup.string().required('Registration type is required'),
    }),
  });

  const manualYesSchema = Yup.object().shape({
    otp: isNullUndefined(item)
      ? Yup.string().required('OTP is required')
      : Yup.mixed().notRequired(),
    officeEmail: Yup.string().required('Office email is required'),

    selectedGender: Yup.object({
      name: Yup.string().required('Gender is required'),
    }),
    placeOfPosting: Yup.string().required('Place of posting is required'),
    selectedDesignation: Yup.object({
      name: Yup.string().required('Designation is required'),
    }),
    name: Yup.string().required('Name is required'),
    selectedTrainingName: Yup.object({
      name: Yup.string().required('Training name is required'),
    }),
    selectedTrainingCenter: Yup.object({
      name: Yup.string().required('Training center is required'),
    }),
    selectedIsAlereadyRegistred: Yup.object({
      name: Yup.string().required('Is already registred  is required'),
    }),
    selectedRegistration: Yup.object({
      name: Yup.string().required('Registration type is required'),
    }),
  });

  const manualNoSchema = Yup.object().shape({
    otp: isNullUndefined(item)
      ? Yup.string().required('OTP is required')
      : Yup.mixed().notRequired(),
    signature: Yup.object({
      uri: Yup.string().required('Signature is required'),
    }),
    photo: Yup.object({
      uri: Yup.string().required('Photo is required'),
    }),
    selectedBloodGroup: Yup.object({
      name: Yup.string().required('Blood group is required'),
    }),
    mobileNumber: Yup.string().required('Mobile number is required'),
    officeEmail: Yup.string().required('Office email is required'),
    aadharNumber: Yup.string().required('Aadhar number is required'),
    dob: Yup.string().required('DOB is required'),
    selectedGender: Yup.object({
      name: Yup.string().required('Gender is required'),
    }),
    placeOfPosting: Yup.string().required('Place of posting is required'),
    selectedDesignation: Yup.object({
      name: Yup.string().required('Designation is required'),
    }),

    name: Yup.string().required('Name is required'),
    selectedDepartmentList: Yup.object({
      name: Yup.string().required('Department is required'),
    }),
    selectedBatchList: Yup.object({
      name: Yup.string().required('Batch is required'),
    }),

    selectedTrainingName: Yup.object({
      name: Yup.string().required('Training name is required'),
    }),

    selectedTrainingCenter: Yup.object({
      name: Yup.string().required('Training center is required'),
    }),
    selectedIsAlereadyRegistred: Yup.object({
      name: Yup.string().required('Is already registred  is required'),
    }),
    selectedRegistration: Yup.object({
      name: Yup.string().required('Registration type is required'),
    }),
  });

  const getActiveSchema = () => {
    if (isBulk) return bulkSchema;
    if (isManual && isNo) return manualNoSchema;
    if (isManual && isYes) return manualYesSchema;
    return Yup.object();
  };

  const onSubmit = () => {
    const activeSchema = getActiveSchema();

    activeSchema
      .validate(form)
      .then(() => {
        if (item) {
          updateTraineeReg();
        } else {
          if (isBulk) {
            addRegistrationBulk();
          }
          if (isManual) {
            addTraineeReg();
          }
        }
      })
      .catch(err => {
        setErrors({ [err.path]: err.message });
      });
  };

  const addRegistrationBulk = () => {
    setLoader(true);

    const formData = new FormData();
    formData.append(
      'registration_type',
      form.selectedRegistration === 'Bulk Upload'
        ? 'bulkUpload'
        : 'manualUpload',
    );
    formData.append('trainingCentre', form.selectedTrainingCenter.id);
    formData.append('nameOfTrainingProgramme', form.selectedTrainingName.id);
    formData.append('batchNo', form.selectedBatchList.id);
    formData.append('selectRole', 22);
    formData.append('department', form.selectedDepartmentList.id);

    if (form.excelFile?.uri) {
      formData.append('letter', {
        uri: form.excelFile.uri,
        name: form.excelFile.fileName,
        type: form.excelFile.type,
      });
    }

    addTraineeRegistrationBulkApi(formData)
      .unwrap()
      .then((res: any) => {
        navigateToRegistrationList();
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
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };
  const sendOtp = () => {
    setLoader(true);

    const formData = new FormData();
    formData.append(
      'isAlreadyRegistered',
      form.selectedIsAlereadyRegistred.id === 'Yes' ? true : false,
    );
    formData.append('nameOfTrainingProgramme', form.selectedTrainingName.id);
    formData.append('name', form.name);
    formData.append('officeEmail', form.officeEmail);
    formData.append('apiFor', 'SEND_OTP');

    if (form.selectedIsAlereadyRegistred.id === 'No') {
      formData.append('aadhaarNo', form.aadharNumber);
    }

    addTraineeRegistrationApi(formData)
      .unwrap()
      .then((res: any) => {
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

  const addTraineeReg = () => {
    setLoader(true);

    const isAlready = form.selectedIsAlereadyRegistred.id === 'Yes';
    const regType =
      form.selectedRegistration.id === 'Bulk Upload'
        ? 'bulkUpload'
        : 'manualUpload';

    const formDataNo = new FormData();
    formDataNo.append('trainingCentre', form.selectedTrainingCenter.id);
    formDataNo.append('name', form.name);
    formDataNo.append(
      'dob',
      moment(form.dob, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formDataNo.append('aadhaarNo', form.aadharNumber);
    formDataNo.append('officeEmail', form.officeEmail);
    formDataNo.append('mobileNo', form.mobileNumber);
    formDataNo.append('gender', form.selectedGender.id);
    formDataNo.append('designation', form.selectedDesignation.id);
    formDataNo.append('placeOfPosting', form.placeOfPosting);
    formDataNo.append('nameOfTrainingProgramme', form.selectedTrainingName.id);
    formDataNo.append('batchNo', form.selectedBatchList.id);
    formDataNo.append('selectRole', 22);
    formDataNo.append('department', form.selectedDepartmentList.id);
    formDataNo.append('registration_type', regType);
    formDataNo.append('otp', form.otp);
    formDataNo.append('bloodGroup', form.selectedBloodGroup.id);
    formDataNo.append('isAlreadyRegistered', isAlready);

    if (form.photo?.uri) {
      formDataNo.append('photo', {
        uri: form.photo.uri,
        name: form.photo.fileName || 'photo.jpg',
        type: form.photo.type || 'image/jpeg',
      });
    }

    if (form.signature?.uri) {
      formDataNo.append('sign', {
        uri: form.signature.uri,
        name: form.signature.fileName || 'signature.jpg',
        type: form.signature.type || 'image/jpeg',
      });
    }

    const formDataYes = new FormData();
    formDataYes.append('trainingCentre', form.selectedTrainingCenter.id);
    formDataYes.append('name', form.name);
    formDataYes.append('officeEmail', form.officeEmail);
    formDataYes.append('gender', form.selectedGender.id);
    formDataYes.append('designation', form.selectedDesignation.id);
    formDataYes.append('placeOfPosting', form.placeOfPosting);
    formDataYes.append('nameOfTrainingProgramme', form.selectedTrainingName.id);
    formDataYes.append('selectRole', 22);
    formDataYes.append('registration_type', regType);
    formDataYes.append('otp', form.otp);
    formDataYes.append('isAlreadyRegistered', isAlready);

    const payload = isAlready ? formDataYes : formDataNo;

    addTraineeRegistrationApi(payload)
      .unwrap()
      .then(res => {
        navigateToRegistrationList();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };
  const updateTraineeReg = () => {
    setLoader(true);

    const regType =
      form.selectedRegistration.id === 'Bulk Upload'
        ? 'bulkUpload'
        : 'manualUpload';

    const formDataNo = new FormData();
    formDataNo.append('traineeId', item.traineeId);
    formDataNo.append('userUniqueId', item.userUniqueId);
    formDataNo.append('trainingCentre', form.selectedTrainingCenter.id);
    formDataNo.append('name', form.name);
    formDataNo.append(
      'dob',
      moment(form.dob, 'DD-MM-YYYY').format('YYYY-MM-DD'),
    );
    formDataNo.append('aadhaarNo', form.aadharNumber);
    formDataNo.append('officeEmail', form.officeEmail);
    formDataNo.append('originalOfficeEmail', item.officeEmail);
    formDataNo.append('mobileNo', form.mobileNumber);
    formDataNo.append('gender', form.selectedGender.id);
    formDataNo.append('designation', form.selectedDesignation.id);
    formDataNo.append('placeOfPosting', form.placeOfPosting);
    formDataNo.append('nameOfTrainingProgramme', form.selectedTrainingName.id);
    formDataNo.append('batchNo', form.selectedBatchList.id);
    formDataNo.append('batchNoShow', item.batchNo);
    formDataNo.append('selectRole', 22);
    formDataNo.append('department', form.selectedDepartmentList.id);
    formDataNo.append('registration_type', regType);
    formDataNo.append('bloodGroup', form.selectedBloodGroup.id);
    formDataNo.append('training_full_name', form.selectedTrainingName.id);

    if (form.photo?.uri) {
      formDataNo.append('photo', {
        uri: form.photo.uri,
        name: form.photo.fileName || 'photo.jpg',
        type: form.photo.type || 'image/jpeg',
      });
    }

    if (form.signature?.uri) {
      formDataNo.append('sign', {
        uri: form.signature.uri,
        name: form.signature.fileName || 'signature.jpg',
        type: form.signature.type || 'image/jpeg',
      });
    }

    updateTraineeRegistrationApi(formDataNo)
      .unwrap()
      .then(res => {
        navigateToRegistrationList();
        props.route.params?.onDone?.();
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch(err => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setLoader(false);
      });
  };
  const getBloodGroup = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'select_blood_group',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('bloodGroupList', res.data);
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
  const getTraineeDesignation = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'trainee_designation',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('designationList', res.data);
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
  const getDepartment = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'training_department',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('departmentList', res.data);
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
  const getTrainingCenter = () => {
    setLoader(true);
    const params = {
      listType: 'select_training_centre',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
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
  const getGender = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'gender',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('genderList', res.data);
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
  const getTrainingName = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre: [name],
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('trainingNameList', res.data);
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
  const getTrainingBatchNo = (id: string) => {
    setLoader(true);
    const params = {
      listType: 'select_trainee_registration_batch_no',
      bipardCentre: [form.selectedTrainingCenter.name],
      replacements: ['%%', id],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('batchNumberList', res.data);
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

  const handleFileUpload = async () => {
    try {
      const result = await pick({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        allowMultiSelection: false,
      });

      if (result?.[0]) {
        const file = result[0];

        // file size validation
        const MAX_SIZE = 3 * 1024 * 1024;
        if (file.size && file.size > MAX_SIZE) {
          Toast.show({
            type: 'error',
            text2: strings.file_size_exceeded,
          });
          return;
        }

        const fileData = {
          uri: file.uri,
          fileName: file.name,
          type:
            file.type ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: file.size || 0,
        };

        setForm((prev: any) => ({
          ...prev,
          excelFile: fileData,
        }));
        setErrors({
          ...errors,
          'excelFile.uri': '',
        });

        Toast.show({
          type: 'success',
          text2: `${file.name} ${strings.file_selected}`,
        });
      }
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') return;

      Toast.show({
        type: 'error',
        text2: strings.file_pick_failed,
      });
    }
  };

  const isButtonDisabled =
    isManual && !form.selectedIsAlereadyRegistred?.id ? true : false;

  const startOtpTimer = () => {
    setOtpTimer(60);
  };

  const handleGetOtp = () => {
    if (otpTimer > 0) return;

    if (isManual) {
      sendOtp();
    }

    startOtpTimer();
  };

  const validateStep = async (step: number) => {
    const activeSchema = getActiveSchema();
    const step1Fields = [
      'selectedRegistration.name',
      ...(!isBulk ? ['selectedIsAlereadyRegistred.name'] : []),
      ...(show.trainingCenter ? ['selectedTrainingCenter.name'] : []),
      ...(show.trainingName ? ['selectedTrainingName.name'] : []),
      ...(show.batch ? ['selectedBatchList.name'] : []),
      ...(show.department ? ['selectedDepartmentList.name'] : []),
      ...(show.name ? ['name'] : []),
      ...(show.designation ? ['selectedDesignation.name'] : []),
      ...(show.posting ? ['placeOfPosting'] : []),
      ...(show.gender ? ['selectedGender.name'] : []),
      ...(show.dob ? ['dob'] : []),
      ...(show.aadhar ? ['aadharNumber'] : []),
      ...(show.email ? ['officeEmail'] : []),
      ...(show.mobile ? ['mobileNumber'] : []),
      ...(show.blood ? ['selectedBloodGroup.name'] : []),
    ];

    const step2Fields = [
      ...(show.photo ? ['photo.uri'] : []),
      ...(show.signature ? ['signature.uri'] : []),
      ...(show.excelFile ? ['excelFile.uri'] : []),
    ];

    const step3Fields = [...(show.otp && isNullUndefined(item) ? ['otp'] : [])];

    const stepMap: Record<number, string[]> = {
      1: step1Fields,
      2: step2Fields,
      3: step3Fields,
    };

    const fields = stepMap[step] || [];
    for (const field of fields) {
      try {
        await activeSchema.validateAt(field, form);
      } catch (err: any) {
        setErrors((prev: any) => ({ ...prev, [field]: err.message }));
        return false;
      }
    }
    return true;
  };

  const handlePrimaryAction = async () => {
    if (currentStep < steps.length) {
      const isStepValid = await validateStep(currentStep);
      if (!isStepValid) return;
      setCurrentStep(prev => prev + 1);
      return;
    }

    onSubmit();
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <AddTraineeRegistration_1
          form={form}
          errors={errors}
          setValue={setValue}
          setErrors={setErrors}
          trainingCenterList={form.trainingCenterList}
          trainingNameList={form.trainingNameList}
          batchNumberList={form.batchNumberList}
          departmentList={form.departmentList}
          designationList={form.designationList}
          genderList={form.genderList}
          bloodGroupList={form.bloodGroupList}
          isBulk={isBulk}
          isManual={isManual}
          isNo={isNo}
          tenantId={tenantId}
          onTrainingCenterChange={(data: any) => {
            setValue('selectedTrainingCenter', data);
            getGender(data.name);
            getDepartment(data.name);
            getTraineeDesignation(data.name);
            getBloodGroup(data.name);
            getTrainingName(data.name);
            setErrors({ ...errors, 'selectedTrainingCenter.name': '' });
          }}
          onTrainingNameChange={(data: any) => {
            setValue('selectedTrainingName', data);
            getTrainingBatchNo(data.id);
            setErrors({ ...errors, 'selectedTrainingName.name': '' });
          }}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <AddTraineeRegistration_2
          form={form}
          errors={errors}
          setValue={setValue}
          setErrors={setErrors}
          isBulk={isBulk}
          isManual={isManual}
          isNo={isNo}
          onPickExcelFile={handleFileUpload}
        />
      );
    }

    return (
      <AddTraineeRegistration_3
        form={form}
        errors={errors}
        setValue={setValue}
        setErrors={setErrors}
        isManual={isManual}
        showOtp={show.otp && isNullUndefined(item)}
        otpTimer={otpTimer}
        onGetOtp={handleGetOtp}
      />
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <View style={styles.stepperWrap}>
        <FormStepper steps={steps} currentStep={currentStep} />
      </View>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        {renderStep()}

        <View style={styles.footer}>
          {currentStep > 1 && (
            <View style={styles.secondaryButtonWrap}>
              <FormWhiteButton
                title="Back"
                onPress={() => setCurrentStep(prev => prev - 1)}
              />
            </View>
          )}
          <View style={styles.primaryButtonWrap}>
            <FormGradientButton
              title={
                currentStep === steps.length
                  ? item
                    ? 'Update'
                    : 'Add'
                  : 'Next'
              }
              onPress={handlePrimaryAction}
              disabled={isButtonDisabled}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddTraineeRegistration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  stepperWrap: {
    paddingHorizontal: vw(15),
    paddingTop: vh(8),
    paddingBottom: vh(8),
    marginBottom: vh(8),
  },
  contentScroll: {
    paddingBottom: vh(8),
    paddingHorizontal: vw(15),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: vw(15),
    marginTop: vh(16),
    paddingBottom: vh(12),
    gap: vw(10),
  },
  secondaryButtonWrap: {
    flex: 1,
  },
  primaryButtonWrap: {
    flex: 1,
  },
});
