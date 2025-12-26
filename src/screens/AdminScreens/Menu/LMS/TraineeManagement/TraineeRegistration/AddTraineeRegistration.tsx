import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { pick } from '@react-native-documents/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import ErrorMolecule from '../../../../../../components/molecules/ErrorMolecule';
import {
  useAddTraineeRegistrationBulkMutation,
  useAddTraineeRegistrationMutation,
  useUpdateTraineeRegistrationMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { useAppSelector } from '../../../../../../hooks';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AddTraineeRegistration = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();
  const input6_ref: any = createRef();

  const [otpTimer, setOtpTimer] = useState(0);

  const [commonDropdownListApi] = useCommonDropdownListMutation();

  const [addTraineeRegistrationBulkApi] =
    useAddTraineeRegistrationBulkMutation();
  const [addTraineeRegistrationApi] = useAddTraineeRegistrationMutation();
  const [updateTraineeRegistrationApi] = useUpdateTraineeRegistrationMutation();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item)
        ? 'Add Trainee Registration'
        : 'Edit Trainee Registration',
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    registrationTypeList: [
      { id: 'Bulk Upload', name: 'Bulk Upload' },
      { id: 'Manual Upload', name: 'Manual Upload' },
    ],
    selectedRegistration: { id: 'Bulk Upload', name: 'Bulk Upload' },
    isAlereadyRegistredList: [
      { id: 'Yes', name: 'Yes' },
      { id: 'No', name: 'No' },
    ],
    selectedIsAlereadyRegistred: {},
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
        navigation.goBack();
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
        navigation.goBack();
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
          label={'Registration Type'}
          placeholder={'Registration Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Registration Type',
              Data: form.registrationTypeList,
              selectedData: form.selectedRegistration,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedRegistration: data,
                }));

                setErrors({ ...errors, 'selectedRegistration.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedRegistration?.name}
          isMandatory
          errorMessage={errors['selectedRegistration.name']}
        />
        {!isBulk && (
          <DropDownOrganism
            label={'Is Aleready Registred?'}
            placeholder={'Is Aleready Registred'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Is Aleready Registred',
                Data: form.isAlereadyRegistredList,
                selectedData: form.selectedIsAlereadyRegistred,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedIsAlereadyRegistred: data,
                  }));
                  setErrors({
                    ...errors,
                    'selectedIsAlereadyRegistred.name': '',
                  });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedIsAlereadyRegistred?.name}
            isMandatory
            errorMessage={errors['selectedIsAlereadyRegistred.name']}
          />
        )}

        {show.trainingCenter && (
          <DropDownOrganism
            label={'Training Center'}
            placeholder={'Training Center'}
            onPress={() => {
              // Only allow superadmin (tenantId === 3) to change
              if (tenantId !== 3) return;

              navigation.navigate('DropDownModal', {
                name: 'Training Center',
                Data: form.trainingCenterList,
                selectedData: form.selectedTrainingCenter,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedTrainingCenter: data,
                  }));
                  getGender(data.name);

                  getDepartment(data.name);
                  getTraineeDesignation(data.name);
                  getBloodGroup(data.name);
                  getTrainingName(data.name);
                  setErrors({ ...errors, 'selectedTrainingCenter.name': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedTrainingCenter?.name}
            isMandatory
            errorMessage={errors['selectedTrainingCenter.name']}
            isDisabled={tenantId !== 3}
          />
        )}

        {show.trainingName && (
          <DropDownOrganism
            label={'Training Name'}
            placeholder={'Training Name'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Training Name',
                Data: form.trainingNameList,
                selectedData: form.selectedTrainingName,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedTrainingName: data,
                  }));
                  getTrainingBatchNo(data.id);
                  setErrors({ ...errors, 'selectedTrainingName.name': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedTrainingName?.name}
            isMandatory
            errorMessage={errors['selectedTrainingName.name']}
          />
        )}

        {show.batch && (
          <DropDownOrganism
            label={'Batch'}
            placeholder={'Batch'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Batch',
                Data: form.batchNumberList,
                selectedData: form.selectedBatchList,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedBatchList: data,
                  }));
                  setErrors({ ...errors, 'selectedBatchList.name': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedBatchList?.name}
            isMandatory
            errorMessage={errors['selectedBatchList.name']}
          />
        )}
        {show.department && (
          <DropDownOrganism
            label={'Department'}
            placeholder={'Department'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Department',
                Data: form.departmentList,
                selectedData: form.selectedDepartmentList,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedDepartmentList: data,
                  }));
                  setErrors({ ...errors, 'selectedDepartmentList.name': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedDepartmentList?.name}
            isMandatory
            errorMessage={errors['selectedDepartmentList.name']}
          />
        )}

        {show.name && (
          <TextInputOrganisms
            label={'Name'}
            placeholder={'Name'}
            ref={input1_ref}
            onSubmitEditing={() => input2_ref.current.focus()}
            value={form.name}
            onChangeText={(val: any) => {
              setForm((prev: any) => ({
                ...prev,
                name: val,
              }));
              setErrors({ ...errors, name: '' });
            }}
            isMandatory
            errorMessage={errors.name}
            autoCapitalize={'none'}
            returnKeyType={'next'}
          />
        )}

        {show.designation && (
          <DropDownOrganism
            label={'Designation'}
            placeholder={'Designation'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Designation',
                Data: form.designationList,
                selectedData: form.selectedDesignation,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedDesignation: data,
                  }));
                  setErrors({ ...errors, 'selectedDesignation.name': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedDesignation?.name}
            isMandatory
            errorMessage={errors['selectedDesignation.name']}
          />
        )}

        {show.posting && (
          <TextInputOrganisms
            label={'Place Of Posting'}
            placeholder={'Place Of Posting'}
            ref={input2_ref}
            onSubmitEditing={() => input3_ref.current.focus()}
            value={form.placeOfPosting}
            onChangeText={(val: any) => {
              setForm((prev: any) => ({
                ...prev,
                placeOfPosting: val,
              }));
              setErrors({ ...errors, placeOfPosting: '' });
            }}
            isMandatory
            errorMessage={errors.placeOfPosting}
            autoCapitalize={'none'}
            returnKeyType={'next'}
          />
        )}

        {show.gender && (
          <DropDownOrganism
            label={'Gender'}
            placeholder={'Gender'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Gender',
                Data: form.genderList,
                selectedData: form.selectedGender,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedGender: data,
                  }));
                  setErrors({ ...errors, 'selectedGender.name': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedGender?.name}
            isMandatory
            errorMessage={errors['selectedGender.name']}
          />
        )}

        {show.dob && (
          <DateInputOrganism
            label={'DOB'}
            placeholder={'DOB'}
            value={form.dob}
            onChangeText={(val: any) => {
              setForm((prev: any) => ({
                ...prev,
                dob: val,
              }));
              setErrors({ ...errors, dob: '' });
            }}
            fieldName={'date'}
            dateFormat="DD-MM-YYYY"
            isMandatory
            errorMessage={errors.dob}
          />
        )}

        {show.aadhar && (
          <TextInputOrganisms
            label={'Aadhar Number'}
            placeholder={'Aadhar Number'}
            ref={input4_ref}
            onSubmitEditing={() => input5_ref.current.focus()}
            value={form.aadharNumber}
            onChangeText={(val: any) => {
              setForm((prev: any) => ({
                ...prev,
                aadharNumber: normalizeNumber(val),
              }));
              setErrors({ ...errors, aadharNumber: '' });
            }}
            isMandatory
            errorMessage={errors.aadharNumber}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            maxLength={12}
            keyboardType="numeric"
          />
        )}

        {show.email && (
          <TextInputOrganisms
            label={'Office Email'}
            placeholder={'Office Email'}
            ref={input4_ref}
            onSubmitEditing={() => input5_ref.current.focus()}
            value={form.officeEmail}
            onChangeText={(val: any) => {
              setForm((prev: any) => ({
                ...prev,
                officeEmail: val,
              }));
              setErrors({ ...errors, officeEmail: '' });
            }}
            isMandatory
            errorMessage={errors.officeEmail}
            autoCapitalize={'none'}
            returnKeyType={'next'}
          />
        )}

        {show.mobile && (
          <TextInputOrganisms
            label={'Mobile Number'}
            placeholder={'Mobile Number'}
            ref={input5_ref}
            onSubmitEditing={() => input6_ref.current.focus()}
            value={form.mobileNumber}
            onChangeText={(val: any) => {
              setForm((prev: any) => ({
                ...prev,
                mobileNumber: normalizeNumber(val),
              }));
              setErrors({ ...errors, mobileNumber: '' });
            }}
            isMandatory
            errorMessage={errors.mobileNumber}
            autoCapitalize={'none'}
            returnKeyType={'next'}
            maxLength={10}
            keyboardType="numeric"
          />
        )}

        {show.blood && (
          <DropDownOrganism
            label={'Blood Group'}
            placeholder={'Blood Group'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Blood Group',
                Data: form.bloodGroupList,
                selectedData: form.selectedBloodGroup,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedBloodGroup: data,
                  }));
                  setErrors({ ...errors, 'selectedBloodGroup.name': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedBloodGroup?.name}
            isMandatory
            errorMessage={errors['selectedBloodGroup.name']}
          />
        )}

        {show.photo && (
          <ImageUploadOrganism
            label={'photo'}
            buttonText={strings.choose_file}
            onSelectImage={(file: any) => {
              setForm((prev: any) => ({
                ...prev,
                photo: file,
              }));
              setErrors({ ...errors, 'photo.uri': '' });
            }}
            defaultImage={form.photo?.uri}
            isMandatory
            errorMessage={errors['photo.uri']}
          />
        )}

        {show.signature && (
          <ImageUploadOrganism
            label={'Signature'}
            buttonText={strings.choose_file}
            onSelectImage={(file: any) => {
              setForm((prev: any) => ({
                ...prev,
                signature: file,
              }));
              setErrors({ ...errors, 'signature.uri': '' });
            }}
            defaultImage={form.signature?.uri}
            isMandatory
            errorMessage={errors['signature.uri']}
          />
        )}

        {show.otp && isNullUndefined(item) && (
          <>
            <TextInputOrganisms
              label={'OTP'}
              placeholder={'OTP'}
              ref={input6_ref}
              onSubmitEditing={() => Keyboard.dismiss()}
              value={form.otp}
              onChangeText={(val: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  otp: normalizeNumber(val),
                }));
                setErrors({ ...errors, otp: '' });
              }}
              isMandatory
              errorMessage={errors.otp}
              autoCapitalize={'none'}
              returnKeyType={'next'}
              maxLength={4}
              keyboardType="numeric"
            />

            <TextAtom
              style={{
                backgroundColor: otpTimer > 0 ? colors.grey : colors.primary,
                color: colors.white,
                fontFamily: fonts.Roboto_Regular,
                fontSize: vw(12),
                width: vw(100),
                borderRadius: vw(4),
                textAlign: 'center',
                paddingVertical: vh(4),
                marginLeft: vh(8),
                opacity: otpTimer > 0 ? 0.7 : 1,
              }}
              onPress={otpTimer > 0 ? undefined : handleGetOtp}
            >
              {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Get OTP'}
            </TextAtom>
          </>
        )}
        {show.excelFile && (
          <>
            <TextAtom style={styles.labelStyle} numberOfLines={2}>
              Upload File
            </TextAtom>
            <TouchableOpacity
              style={[
                styles.uploadBtn,
                {
                  borderColor: errors['uploadFile.uri']
                    ? colors.red
                    : colors.grey_1,
                },
              ]}
              activeOpacity={0.8}
              onPress={handleFileUpload}
            >
              <TextAtom numberOfLines={0} style={styles.uploadText}>
                {isNullUndefined(form.excelFile)
                  ? strings.choose_file
                  : form.excelFile.fileName}
              </TextAtom>
              <TextAtom style={styles.instructionText}>{'Add Excel'}</TextAtom>
            </TouchableOpacity>

            <TextAtom
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
                fontFamily: fonts.Roboto_Regular,
                fontSize: vw(12),
                width: vw(120),
                borderRadius: vw(4),
                textAlign: 'center',
                paddingVertical: vh(4),
                marginLeft: vh(8),
              }}
              onPress={() => {}}
            >
              Download Sample
            </TextAtom>
            <ErrorMolecule errorMessage={errors['excelFile.uri']} />
          </>
        )}
      </KeyboardAwareScrollView>
      <ButtonOrganism
        onPress={onSubmit}
        bttnText={item ? 'Update' : 'Add'}
        isDisabled={isButtonDisabled}
      />
    </SafeAreaView>
  );
};

export default AddTraineeRegistration;

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
    fontSize: vw(12),
    textAlign: 'center',
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
