import {
  Alert,
  Keyboard,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { CommonActions } from '@react-navigation/native';
import { pick } from '@react-native-documents/picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
import { useReleaseTraineeFromTrainingMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TraineeReleaseForm = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();
  const input5_ref: any = createRef();

  const [commonDropdownListApi] = useCommonDropdownListMutation();
  const [releaseTraineeFromTrainingApi] =
    useReleaseTraineeFromTrainingMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Trainee Release Form');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState<any>({
    trainingCenterList: [],
    selectedTrainingCenter: {},
    trainingNameList: [],
    selectedTrainingName: {},
    batchNumberList: [],
    selectedBatchList: {},
    departmentList: [],
    selectedDepartmentList: {},
    name: '',
    dob: '',
    aadharNumber: '',
    officeEmail: '',
    mobileNumber: '',
    genderList: [],
    selectedGender: {},
    reasonList: [],
    selectedReason: {},
    releaseRemark: '',
    file: {},
  });
  const [errors, setErrors] = useState<any>({});

  const setValue = (key: any, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    getTrainingCenter();
  }, []);

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
      getTrainingName(selectedTC.name),
      getTrainingReleaseReason(selectedTC.name),
    ]);
  };

  useEffect(() => {
    if (!item) return;

    if (
      form.genderList.length &&
      form.departmentList.length &&
      form.trainingNameList.length
    ) {
      prefillStage2();
    }
  }, [form.genderList, form.departmentList, form.trainingNameList]);

  const prefillStage2 = async () => {
    const training = form.trainingNameList.find(
      (x: any) => x.id == item.nameOfTrainingProgrammeId,
    );
    setValue('selectedTrainingName', training);

    getTrainingBatchNo(training.id);
    const batch = form.batchNumberList.find((x: any) => x.id == item.batchNoId);
    setValue('selectedBatchList', batch);

    setValue(
      'selectedDepartmentList',
      form.departmentList.find((x: any) => x.id === item.departmentId) || {},
    );

    setValue(
      'selectedGender',
      form.genderList.find((x: any) => x.name === item.gender),
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

  const schema = Yup.object().shape({
    releaseRemark: Yup.string().required('Release remark is required'),

    selectedReason: Yup.object({
      name: Yup.string().required('Reason is required'),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      navigation.navigate(screensName.AlertOrganism, {
        title: 'Trainee Release Confirmation',
        message: 'Are you sure you want to release this trainee?',
        okText: 'Confirm',
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          trainneeRelease();
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

  const handleFileUpload = async () => {
    try {
      const result = await pick({
        type: [
          'image/*',
          'application/pdf',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
        ],
        allowMultiSelection: false,
      });

      if (result && result[0]) {
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
          type: file.type,
          size: file.size || 0,
        };

        setForm((prev: any) => ({
          ...prev,
          file: fileData,
        }));
        setErrors({
          ...errors,
          'file.uri': '',
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

  const trainneeRelease = () => {
    setLoader(true);
    const formData = new FormData();

    formData.append('traineeId', item.traineeId);
    formData.append('trainingId', item.nameOfTrainingProgrammeId);
    formData.append('remark', form.releaseRemark);
    formData.append('reason', form.selectedReason.id);
    if (form.file?.uri) {
      formData.append('attachment', {
        uri: form.file.uri,
        name: form.file.fileName,
        type: form.file.type,
      });
    }
    releaseTraineeFromTrainingApi(formData)
      .unwrap()
      .then((res: any) => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: screensName.TraineeRelease }],
          }),
        );
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
              Data: form.trainingCenterList,
              selectedData: form.selectedTrainingCenter,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedTrainingCenter: data,
                }));
                getGender(data.name);
                getDepartment(data.name);
                getTrainingName(data.name);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedTrainingCenter?.name}
          isDisabled={!isNullUndefined(item)}
        />

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
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedTrainingName?.name}
          isDisabled={!isNullUndefined(item)}
        />

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
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedBatchList?.name}
          isDisabled={!isNullUndefined(item)}
        />

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
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedDepartmentList?.name}
          isDisabled={!isNullUndefined(item)}
        />

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
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          disabled
          editable={!isNullUndefined(item)}
        />

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
          isDisable={!isNullUndefined(item)}
        />

        <TextInputOrganisms
          label={'Aadhar Number'}
          placeholder={'Aadhar Number'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref.current.focus()}
          value={form.aadharNumber}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              aadharNumber: normalizeNumber(val),
            }));
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          maxLength={12}
          keyboardType="numeric"
          disabled
          editable={!isNullUndefined(item)}
        />

        <TextInputOrganisms
          label={'Office Email'}
          placeholder={'Office Email'}
          ref={input3_ref}
          onSubmitEditing={() => input4_ref.current.focus()}
          value={form.officeEmail}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              officeEmail: val,
            }));
          }}
          isMandatory
          autoCapitalize={'none'}
          returnKeyType={'next'}
          disabled
          editable={!isNullUndefined(item)}
        />

        <TextInputOrganisms
          label={'Mobile Number'}
          placeholder={'Mobile Number'}
          ref={input4_ref}
          onSubmitEditing={() => input5_ref.current.focus()}
          value={form.mobileNumber}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              mobileNumber: normalizeNumber(val),
            }));
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          maxLength={10}
          keyboardType="numeric"
          disabled
          editable={!isNullUndefined(item)}
        />

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
          isDisabled={!isNullUndefined(item)}
        />

        <DropDownOrganism
          label={'Reason'}
          placeholder={'Reason'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Reason',
              Data: form.reasonList,
              selectedData: form.selectedReason,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedReason: data,
                }));
                setErrors({ ...errors, 'selectedReason.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedReason?.name}
          isMandatory
          errorMessage={errors['selectedReason.name']}
        />

        <TextInputOrganisms
          label={'Release Remark'}
          placeholder={'Release Remark'}
          ref={input5_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.releaseRemark}
          onChangeText={(val: any) => {
            setForm((prev: any) => ({
              ...prev,
              releaseRemark: val,
            }));
            setErrors({ ...errors, releaseRemark: '' });
          }}
          isMandatory
          errorMessage={errors.releaseRemark}
          autoCapitalize={'none'}
          returnKeyType={'done'}
        />

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
            {!isNullUndefined(form.file)
              ? form.file.fileName
              : strings.choose_file}
          </TextAtom>
          <TextAtom style={styles.instructionText}>{'Add File'}</TextAtom>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
      <ButtonOrganism onPress={onSubmit} bttnText={'Release Trainee'} />
    </SafeAreaView>
  );
};

export default TraineeReleaseForm;

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
