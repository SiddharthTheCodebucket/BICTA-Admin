import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { pick } from '@react-native-documents/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';

import {
  colors,
  fonts,
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
import {
  isNullUndefined,
  normalizeNumber,
} from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useReleaseTraineeFromTrainingMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

import {
  FormDropdownFieldWithTitle,
  FormTextInputWithTitle,
  FormFileUploadWithTitle,
  FormGradientButton,
  FormFieldWrapper,
} from '../../../../../../components/templates';

type DropdownItem = {
  [key: string]: any;
};

type FileData = {
  uri: string;
  name: string;
  type?: string | null;
  size?: number | null;
};

interface Props {
  route: any;
  navigation: NavigationType;
}

const TraineeReleaseForm = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [releaseTraineeFromTrainingApi] =
    useReleaseTraineeFromTrainingMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    trainingCenterList: [],
    selectedTrainingCenter: null,

    trainingNameList: [],
    selectedTrainingName: null,

    batchNumberList: [],
    selectedBatchList: null,

    departmentList: [],
    selectedDepartmentList: null,

    name: '',
    dob: '',
    aadharNumber: '',
    officeEmail: '',
    mobileNumber: '',

    genderList: [],
    selectedGender: null,

    reasonList: [],
    selectedReason: null,

    releaseRemark: '',
    file: null as FileData | null,
  });

  const [errors, setErrors] = useState<any>({});

  const setValue = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Trainee Release Form');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    getTrainingCenter();
  }, []);

  useEffect(() => {
    if (!item) return;
    if (form.trainingCenterList.length === 0) return;

    prefillStage1();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, form.trainingCenterList]);

  useEffect(() => {
    if (!item) return;

    if (
      form.genderList.length &&
      form.departmentList.length &&
      form.trainingNameList.length
    ) {
      prefillStage2();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.genderList, form.departmentList, form.trainingNameList]);

  useEffect(() => {
    if (!item) return;

    if (
      form.trainingNameList.length > 0 &&
      form.batchNumberList.length > 0 &&
      item.batchNoId
    ) {
      const batch = form.batchNumberList.find(
        (x: any) => x.id == item.batchNoId,
      );
      if (batch) setValue('selectedBatchList', batch);
    }

    if (form.departmentList.length > 0 && item.departmentId) {
      const dept = form.departmentList.find(
        (x: any) => x.id == item.departmentId,
      );
      if (dept) setValue('selectedDepartmentList', dept);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.batchNumberList, form.departmentList]);

  const prefillStage1 = async () => {
    const selectedTC = form.trainingCenterList.find(
      (x: any) => x.name === item.trainingCentre,
    );
    if (!selectedTC) return;

    setValue('selectedTrainingCenter', selectedTC);

    await Promise.all([
      getGender(selectedTC.name),
      getDepartment(selectedTC.name),
      getTrainingName(selectedTC.name),
      getTrainingReleaseReason(selectedTC.name),
    ]);
  };

  const prefillStage2 = async () => {
    const training = form.trainingNameList.find(
      (x: any) => x.id == item.nameOfTrainingProgrammeId,
    );

    if (training) {
      setValue('selectedTrainingName', training);
      getTrainingBatchNo(training.id);
    }

    setValue(
      'selectedDepartmentList',
      form.departmentList.find((x: any) => x.id === item.departmentId) || null,
    );

    setValue(
      'selectedGender',
      form.genderList.find((x: any) => x.name === item.gender) || null,
    );

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

  const schema = Yup.object().shape({
    releaseRemark: Yup.string().required('Release remark is required'),
    selectedReason: Yup.object({
      name: Yup.string().required('Reason is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form, { abortEarly: true });

      navigation.navigate(screensName.AlertOrganism, {
        title: 'Trainee Release Confirmation',
        message: 'Are you sure you want to release this trainee?',
        okText: 'Confirm',
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          traineeRelease();
        },
        cancelFunction: () => {},
      });
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
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
      bipardCentre: [form.selectedTrainingCenter?.name],
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

  const getTrainingReleaseReason = (name: string) => {
    setLoader(true);
    const params = {
      listType: 'select_trainee_release_reason',
      bipardCentre: [name],
      replacements: ['%%'],
    };

    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('reasonList', res.data);
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

  const handleFileSelected = async (file: FileData | null) => {
    if (!file) {
      setValue('file', null);
      return;
    }

    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size && file.size > MAX_SIZE) {
      Toast.show({
        type: 'error',
        text2: strings.file_size_exceeded,
      });
      return;
    }

    setValue('file', file);
    Toast.show({
      type: 'success',
      text2: `${file.name} ${strings.file_selected}`,
    });
  };

  const traineeRelease = () => {
    setLoader(true);
    const formData = new FormData();

    formData.append('traineeId', item.traineeId);
    formData.append('trainingId', item.nameOfTrainingProgrammeId);
    formData.append('remark', form.releaseRemark);
    formData.append('reason', form.selectedReason.id);

    if (form.file?.uri) {
      formData.append('attachment', {
        uri: form.file.uri,
        name: form.file.name,
        type: form.file.type,
      } as any);
    }

    releaseTraineeFromTrainingApi(formData)
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
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const disabled = !isNullUndefined(item);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <View style={{ paddingHorizontal: vw(16), paddingBottom: vh(24) }}>
          <FormFieldWrapper>
            <FormDropdownFieldWithTitle
              title="Training Center"
              placeholder="Training Center"
              data={form.trainingCenterList}
              value={form.selectedTrainingCenter}
              labelField="name"
              valueField="id"
              search
              disabled={disabled}
              onChange={(data: DropdownItem) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedTrainingCenter: data,
                  selectedTrainingName: null,
                  selectedBatchList: null,
                  selectedDepartmentList: null,
                  selectedGender: null,
                  reasonList: [],
                  selectedReason: null,
                  trainingNameList: [],
                  batchNumberList: [],
                  departmentList: [],
                  genderList: [],
                }));

                getGender(data.name);
                getDepartment(data.name);
                getTrainingName(data.name);
                getTrainingReleaseReason(data.name);
              }}
            />
            <FormDropdownFieldWithTitle
              title="Training Name"
              placeholder="Training Name"
              data={form.trainingNameList}
              value={form.selectedTrainingName}
              labelField="name"
              valueField="id"
              search
              disabled={disabled}
              onChange={(data: DropdownItem) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedTrainingName: data,
                  selectedBatchList: null,
                  batchNumberList: [],
                }));

                getTrainingBatchNo(data.id);
              }}
            />
            <FormDropdownFieldWithTitle
              title="Batch"
              placeholder="Batch"
              data={form.batchNumberList}
              value={form.selectedBatchList}
              labelField="name"
              valueField="id"
              search
              disabled={disabled}
              onChange={(data: DropdownItem) => {
                setValue('selectedBatchList', data);
              }}
            />
            <FormDropdownFieldWithTitle
              title="Department"
              placeholder="Department"
              data={form.departmentList}
              value={form.selectedDepartmentList}
              labelField="name"
              valueField="id"
              search
              disabled={disabled}
              onChange={(data: DropdownItem) => {
                setValue('selectedDepartmentList', data);
              }}
            />
            <FormTextInputWithTitle
              title="Name"
              placeholder="Name"
              value={form.name}
              editable={false}
            />
            <FormTextInputWithTitle
              title="DOB"
              placeholder="DOB"
              value={form.dob}
              editable={false}
            />
            <FormTextInputWithTitle
              title="Aadhar Number"
              placeholder="Aadhar Number"
              value={form.aadharNumber}
              maxLength={12}
              keyboardType="numeric"
              editable={false}
            />
            <FormTextInputWithTitle
              title="Office Email"
              placeholder="Office Email"
              value={form.officeEmail}
              editable={false}
            />
            <FormTextInputWithTitle
              title="Mobile Number"
              placeholder="Mobile Number"
              value={form.mobileNumber}
              maxLength={10}
              keyboardType="numeric"
              editable={false}
            />
            <FormDropdownFieldWithTitle
              title="Gender"
              placeholder="Gender"
              data={form.genderList}
              value={form.selectedGender}
              labelField="name"
              valueField="id"
              search
              isMandatory
              errorMessage={errors['selectedGender.name']}
              disabled={disabled}
              onChange={(data: DropdownItem) => {
                setValue('selectedGender', data);
                setErrors((prev: any) => ({
                  ...prev,
                  'selectedGender.name': '',
                }));
              }}
            />
            <FormDropdownFieldWithTitle
              title="Reason"
              placeholder="Reason"
              data={form.reasonList}
              value={form.selectedReason}
              labelField="name"
              valueField="id"
              search
              isMandatory
              errorMessage={errors['selectedReason.name']}
              onChange={(data: DropdownItem) => {
                setValue('selectedReason', data);
                setErrors((prev: any) => ({
                  ...prev,
                  'selectedReason.name': '',
                }));
              }}
            />
            <FormTextInputWithTitle
              title="Release Remark"
              placeholder="Release Remark"
              value={form.releaseRemark}
              onChangeText={(val: string) => {
                setForm((prev: any) => ({
                  ...prev,
                  releaseRemark: val,
                }));
                setErrors((prev: any) => ({ ...prev, releaseRemark: '' }));
              }}
              isMandatory
              errorMessage={errors.releaseRemark}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            <FormFileUploadWithTitle
              title="Upload File"
              fileName={form.file?.name}
              errorMessage={errors['file.uri']}
              onFileSelected={handleFileSelected}
              onFileRemove={() => setValue('file', null)}
              accept={[
                'image/*',
                'application/pdf',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
              ]}
              maxSizeMB={3}
            />
          </FormFieldWrapper>
          <View style={{ marginTop: vh(16) }}>
            <FormGradientButton
              title="Release Trainee"
              onPress={onSubmit}
              loading={loader}
              disabled={loader}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default TraineeReleaseForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    // alignItems: 'center',
  },
});
