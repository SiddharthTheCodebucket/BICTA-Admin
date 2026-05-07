import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import React, { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors, fonts, strings, vh, vw } from '../../../../../../../constants';
import { useAppSelector } from '../../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../../components/organisms/HeaderOrganism';
import TextInputOrganisms from '../../../../../../../components/organisms/TextInputOrganisms';
import DropDownOrganism from '../../../../../../../components/organisms/DropDownOrganism';
import ButtonOrganism from '../../../../../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../../../../../components/organisms/FullscreenLoading';
import { isNullUndefined } from '../../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useHouseKeepingAddTaskMasterMutation,
  useHouseKeepingUpdateTaskMasterMutation,
} from '../../../../../../../injectEndpoints/houseKeepingManagementEndpoints';
import ViewAtom from '../../../../../../../components/atoms/ViewAtom';
import TextAtom from '../../../../../../../components/atoms/TextAtom';

interface Props {
  route: any;
  navigation: NavigationType;
}

const initialForm = {
  bipardLocationList: [],
  bipardLocation: {},
  locationList: [],
  selectedLocation: {},
  buildingTypeList: [],
  selectedBuildingType: {},
  buildingList: [],
  selectedBuilding: {},
  taskTypeList: [],
  selectedTaskType: {},
  taskTitle: '',
  staffList: [],
  selectedStaff: [],
  supportAdminList: [],
  selectedSupportAdmin: [],
  requiredSkills: '',
  description: '',
};

const AddTaskMaster = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData.user[0].tenantId;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useHouseKeepingAddTaskMasterMutation();
  const [updateApi] = useHouseKeepingUpdateTaskMasterMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isNullUndefined(item) ? 'Add Task Master' : 'Update Task Master',
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
    getBipardCenter();
    if (!item) return;

    const locationMap: any = {
      1: { id: 'Gaya', name: 'Gaya' },
      2: { id: 'Patna', name: 'Patna' },
    };

    const bipardLocation = locationMap[item.tenantId];

    const selectedLocation = {
      id: item.locationCampus,
      name: item.locationCampus,
    };

    const selectedBuildingType = {
      id: item.buildingTypeId,
      name: item.buildingType,
    };

    const selectedBuilding = {
      id: item.buildingOrAreaId,
      name: item.buildingOrArea,
    };

    const selectedTaskType = {
      id: item.taskTypeId,
      name: item.taskType,
    };

    const selectedStaff =
      item.staffId?.map((id: number, index: number) => ({
        id,
        name: item.staffName[index],
      })) || [];

    const selectedSupportAdmin =
      item.supportAdminId?.map((id: number, index: number) => ({
        id,
        name: item.supportAdminName[index],
      })) || [];

    setForm((prev: any) => ({
      ...prev,
      bipardLocation,
      selectedLocation,
      selectedBuildingType,
      selectedBuilding,
      selectedTaskType,
      selectedStaff,
      selectedSupportAdmin,
      taskTitle: item.taskTitle,
      requiredSkills: item.requiredSkills,
      description: item.taskDescription,
    }));

    getLocationList(bipardLocation.id);
    getTaskTypeList(bipardLocation.id);
    getStaffList(bipardLocation.id);
    getAdminList(bipardLocation.id);
    getBuildingType();
  }, [item]);

  useEffect(() => {
    if (item?.isLmsTraining === 'Yes' && form.trainingList?.length > 0) {
      const selectedTraining = form.trainingList.find(
        (t: any) => t.id === item?.lmsTrainingId,
      );

      if (selectedTraining) {
        setForm((prev: any) => ({
          ...prev,
          selectedTraining,
        }));
      }
    }
  }, [form.trainingList]);

  const schema = Yup.object().shape({
    requiredSkills: Yup.string().required('Required Skills is required'),
    selectedSupportAdmin: Yup.array()
      .min(1, 'At least one support admin is required')
      .required('At least one support admin is required'),
    selectedStaff: Yup.array()
      .min(1, 'At least one staff is required')
      .required('At least one staff is required'),
    taskTitle: Yup.string().required('Task Title is required'),
    selectedTaskType: Yup.object({
      id: Yup.string().required('Task Type is required'),
    }),
    selectedBuilding:
      form.selectedLocation?.id === 'Inside BIPARD'
        ? Yup.object({
            id: Yup.string().required(
              form.selectedBuildingType.id === 1
                ? 'Hostel Building is required'
                : 'Other Building is required',
            ),
          })
        : Yup.mixed().notRequired(),
    selectedBuildingType:
      form.selectedLocation?.id === 'Inside BIPARD'
        ? Yup.object({
            id: Yup.string().required('Building Type is required'),
          })
        : Yup.mixed().notRequired(),
    selectedLocation: Yup.object({
      id: Yup.string().required('Location is required'),
    }),
    bipardLocation: Yup.object({
      name: Yup.string().required(
        strings.hostelManagement.addBedDetails.required.location,
      ),
    }),
  });

  const onSubmit = () => {
    try {
      schema.validateSync(form);
      if (item) {
        updateDetails();
      } else {
        addDetails();
      }
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const addDetails = () => {
    setLoader(true);
    let params: any = {
      id: null,
      bipardCentre: [form.bipardLocation.id],
      locationCampus: form.selectedLocation.id,

      taskType: form.selectedTaskType.id,
      taskTitle: form.taskTitle,
      staffs: JSON.stringify(form.selectedStaff?.map((t: any) => t.id)),
      supportAdmins: JSON.stringify(
        form.selectedSupportAdmin?.map((t: any) => t.id),
      ),
      requiredSkills: form.requiredSkills,
      taskDescription: form.description,
    };
    if (form.selectedLocation.id === 'Inside BIPARD') {
      params.buildingType = form.selectedBuildingType.id;
    }
    if (form.selectedBuildingType.id === 1) {
      params.hostelBuilding = form.selectedBuilding.id;
    }
    if (form.selectedBuildingType.id === 2) {
      params.otherBuilding = form.selectedBuilding.id;
    }
    addApi(params)
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
  const updateDetails = () => {
    setLoader(true);
    let params: any = {
      id: item.id,
      bipardCentre: [form.bipardLocation.id],
      locationCampus: form.selectedLocation.id,

      taskType: form.selectedTaskType.id,
      taskTitle: form.taskTitle,
      staffs: JSON.stringify(form.selectedStaff?.map((t: any) => t.id)),
      supportAdmins: JSON.stringify(
        form.selectedSupportAdmin?.map((t: any) => t.id),
      ),
      requiredSkills: form.requiredSkills,
      taskDescription: form.description,
    };
    if (form.selectedLocation.id === 'Inside BIPARD') {
      params.buildingType = form.selectedBuildingType.id;
    }
    if (form.selectedBuildingType.id === 1) {
      params.hostelBuilding = form.selectedBuilding.id;
    }
    if (form.selectedBuildingType.id === 2) {
      params.otherBuilding = form.selectedBuilding.id;
    }
    updateApi(params)
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
  const getBipardCenter = () => {
    setLoader(true);
    const params = {
      listType: 'select_training_centre',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('bipardLocationList', res.data);
        if (!item) {
          if (tenantId === 1) {
            setValue('bipardLocation', { id: 'Gaya', name: 'Gaya' });
            getLocationList('Gaya');
            getTaskTypeList('Gaya');
            getStaffList('Gaya');
            getAdminList('Gaya');
          } else if (tenantId === 2) {
            setValue('bipardLocation', { id: 'Patna', name: 'Patna' });
            getLocationList('Patna');
            getTaskTypeList('Patna');
            getStaffList('Patna');
            getAdminList('Patna');
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

  const getLocationList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_campus_location_for_house_keeping',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('locationList', res.data);
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

  const getTaskTypeList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_task_type_for_house_keeping_task_master',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('taskTypeList', res.data);
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
  const getStaffList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_staff_for_house_keeping_task_master',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('staffList', res.data);
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

  const getAdminList = (id: any) => {
    setLoader(true);
    const params = {
      listType: 'select_support_admin',
      bipardCentre: [id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('supportAdminList', res.data);
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

  const getBuildingType = () => {
    setLoader(true);
    const params = {
      listType: 'select_building_type_for_house_keeping',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('buildingTypeList', res.data);
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

  const getHostelBuilding = () => {
    setLoader(true);
    const params = {
      listType: 'select_hostel_name_for_bed_details',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('buildingList', res.data);
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

  const getOtherBuilding = () => {
    setLoader(true);
    const params = {
      listType: 'select_other_building_for_house_keeping',
      bipardCentre: [form.bipardLocation.id],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setValue('buildingList', res.data);
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

  const addStaff = (item: any) => {
    const exists = form.selectedStaff?.some((t: any) => t?.id === item.id);

    if (exists) return;

    const updatedStaff = [...form.selectedStaff, item];

    setForm((prev: any) => ({
      ...prev,
      selectedStaff: updatedStaff,
    }));
  };

  const removeStaff = (id: number) => {
    const updatedStaff = form.selectedStaff.filter(
      (item: any) => item.id !== id,
    );

    setForm((prev: any) => ({
      ...prev,
      selectedStaff: updatedStaff,
    }));
  };

  const addAdmin = (item: any) => {
    const exists = form.selectedSupportAdmin?.some(
      (t: any) => t?.id === item.id,
    );

    if (exists) return;

    const updatedSupportAdmin = [...form.selectedSupportAdmin, item];

    setForm((prev: any) => ({
      ...prev,
      selectedSupportAdmin: updatedSupportAdmin,
    }));
  };

  const removeAdmin = (id: number) => {
    const updatedSupportAdmin = form.selectedSupportAdmin.filter(
      (item: any) => item.id !== id,
    );

    setForm((prev: any) => ({
      ...prev,
      selectedSupportAdmin: updatedSupportAdmin,
    }));
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.flex1}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <DropDownOrganism
          label={strings.hostelManagement.addBedDetails.bipardLocation}
          placeholder={strings.hostelManagement.addBedDetails.bipardLocation}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.hostelManagement.addBedDetails.bipardLocation,
              Data: [
                { id: 'Gaya', name: 'Gaya' },
                { id: 'Patna', name: 'Patna' },
              ],
              selectedData: form.bipardLocationList,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  bipardLocation: data,
                }));
                getLocationList(data.id);
                getTaskTypeList(data.id);
                getStaffList(data.id);
                getAdminList(data.id);
                setErrors({ ...errors, 'bipardLocation.name': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.bipardLocation?.name}
          isMandatory
          errorMessage={errors['bipardLocation.name']}
          isDisabled={tenantId !== 3}
        />

        <DropDownOrganism
          label={'Location'}
          placeholder={'Location'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Location',
              Data: form.locationList,
              selectedData: form.selectedLocation,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedLocation: data,
                }));
                if (data?.id === 'Outside BIPARD') {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedBuildingType: {},
                    selectedBuilding: {},
                  }));
                }
                getBuildingType();
                setErrors({ ...errors, 'selectedLocation.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedLocation?.name}
          isMandatory
          errorMessage={errors['selectedLocation.id']}
        />

        {form.selectedLocation?.id === 'Inside BIPARD' && (
          <DropDownOrganism
            label={'Building Type'}
            placeholder={'Building Type'}
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Building Type',
                Data: form.buildingTypeList,
                selectedData: form.selectedBuildingType,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedBuildingType: data,
                    selectedBuilding: {},
                  }));
                  if (data?.id === 1) {
                    getHostelBuilding();
                  } else {
                    getOtherBuilding();
                  }
                  setErrors({ ...errors, 'selectedBuildingType.id': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedBuildingType?.name}
            isMandatory
            errorMessage={errors['selectedBuildingType.id']}
          />
        )}

        {form.selectedBuildingType?.id && (
          <DropDownOrganism
            label={
              form.selectedBuildingType?.id === 1
                ? 'Hostel Building'
                : 'Other Building'
            }
            placeholder={
              form.selectedBuildingType?.id === 1
                ? 'Hostel Building'
                : 'Other Building'
            }
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Building Type',
                Data: form.buildingList,
                selectedData: form.selectedBuilding,
                setSelectedData: (data: any) => {
                  setForm((prev: any) => ({
                    ...prev,
                    selectedBuilding: data,
                  }));
                  setErrors({ ...errors, 'selectedBuilding.id': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={form.selectedBuilding?.name}
            isMandatory
            errorMessage={errors['selectedBuilding.id']}
          />
        )}

        <DropDownOrganism
          label={'Task Type'}
          placeholder={'Task Type'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Task Type',
              Data: form.taskTypeList,
              selectedData: form.selectedTaskType,
              setSelectedData: (data: any) => {
                setForm((prev: any) => ({
                  ...prev,
                  selectedTaskType: data,
                  selectedBuilding: {},
                }));
                setErrors({ ...errors, 'selectedTaskType.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedTaskType?.name}
          isMandatory
          errorMessage={errors['selectedTaskType.id']}
        />

        <TextInputOrganisms
          label={'Task Title'}
          placeholder={'Task Title'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref?.current?.focus()}
          value={form.taskTitle}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('taskTitle', val);
            setErrors({ ...errors, taskTitle: '' });
          }}
          isMandatory
          errorMessage={errors.taskTitle}
        />

        <DropDownOrganism
          label={'Staff'}
          placeholder={'Staff'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Staff',
              Data: form.staffList,
              selectedData: {},
              setSelectedData: (data: any) => {
                addStaff(data);
                setErrors({ ...errors, 'selectedStaff.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedStaff?.name}
          isMandatory
          errorMessage={errors.selectedStaff}
        />

        <ViewAtom style={{ marginTop: vh(0) }}>
          {form.selectedStaff?.length > 0 && (
            <ViewAtom style={styles.permissionScrollWrapper}>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled
              >
                <ViewAtom style={styles.chipContainer}>
                  {form.selectedStaff.map((item: any) => (
                    <ViewAtom key={item?.id} style={styles.chip}>
                      <TextAtom style={styles.chipText}>{item?.name}</TextAtom>

                      <TouchableOpacity
                        onPress={() => removeStaff(item.id)}
                        style={styles.crossBtn}
                      >
                        <TextAtom style={styles.crossText}>✕</TextAtom>
                      </TouchableOpacity>
                    </ViewAtom>
                  ))}
                </ViewAtom>
              </KeyboardAwareScrollView>
            </ViewAtom>
          )}
        </ViewAtom>

        <DropDownOrganism
          label={'Support Admin'}
          placeholder={'Support Admin'}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Support Admin',
              Data: form.supportAdminList,
              selectedData: {},
              setSelectedData: (data: any) => {
                addAdmin(data);
                setErrors({ ...errors, 'selectedSupportAdmin.id': '' });
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={form.selectedSupportAdmin?.name}
          isMandatory
          errorMessage={errors.selectedSupportAdmin}
        />

        <ViewAtom style={{ marginTop: vh(0) }}>
          {form.selectedSupportAdmin?.length > 0 && (
            <ViewAtom style={styles.permissionScrollWrapper}>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled
              >
                <ViewAtom style={styles.chipContainer}>
                  {form.selectedSupportAdmin.map((item: any) => (
                    <ViewAtom key={item?.id} style={styles.chip}>
                      <TextAtom style={styles.chipText}>{item?.name}</TextAtom>

                      <TouchableOpacity
                        onPress={() => removeAdmin(item.id)}
                        style={styles.crossBtn}
                      >
                        <TextAtom style={styles.crossText}>✕</TextAtom>
                      </TouchableOpacity>
                    </ViewAtom>
                  ))}
                </ViewAtom>
              </KeyboardAwareScrollView>
            </ViewAtom>
          )}
        </ViewAtom>
        <TextInputOrganisms
          label={'Required Skills'}
          placeholder={'Required Skills'}
          ref={input2_ref}
          onSubmitEditing={() => input3_ref?.current?.focus()}
          value={form.requiredSkills}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setValue('requiredSkills', val);
            setErrors({ ...errors, requiredSkills: '' });
          }}
          isMandatory
          errorMessage={errors.requiredSkills}
        />

        <TextInputOrganisms
          label={'Description'}
          placeholder={'Description'}
          ref={input3_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={form.description}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          onChangeText={(val: string) => {
            setValue('description', val);
          }}
        />
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

export default AddTaskMaster;

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
  flex1: {
    flex: 1,
  },
  permissionScrollWrapper: {
    maxHeight: vh(160),
    width: vw(328),
    alignSelf: 'center',
    marginTop: vh(6),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: vw(6),
    marginHorizontal: vw(6),
  },
  crossText: {
    color: colors.white,
    fontSize: vw(12),
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: vw(328),
    alignSelf: 'center',
    marginTop: vh(5),
    marginBottom: vh(8),
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: vw(14),
    paddingVertical: vh(6),
    paddingHorizontal: vh(12),
    marginRight: vw(8),
    marginTop: vh(6),
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginLeft: vh(3),
  },

  chipText: {
    color: colors.primary,
    fontSize: vw(12),
    marginRight: vw(6),
  },

  crossBtn: {
    width: vw(18),
    height: vw(18),
    borderRadius: vw(9),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
