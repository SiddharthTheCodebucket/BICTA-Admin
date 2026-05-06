import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import {
  colors,
  fonts,
  images,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  FormDropdownFieldWithTitle,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { globalStyles } from '../../../../../../utils/globalStyles';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useHouseKeepingAddTaskMasterMutation,
  useHouseKeepingUpdateTaskMasterMutation,
} from '../../../../../../injectEndpoints/houseKeepingManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

type Option = {
  id: any;
  name: string;
};

const locationOptions: Option[] = [
  { id: 'Gaya', name: 'Gaya' },
  { id: 'Patna', name: 'Patna' },
];

const getInitialLocation = (tenantId?: number) => {
  if (tenantId === 1) return locationOptions[0];
  if (tenantId === 2) return locationOptions[1];
  return null;
};

const namesToOptions = (ids?: any[], names?: any[]) => {
  if (!Array.isArray(ids) || !Array.isArray(names)) return [];
  return ids.map((id, index) => ({
    id,
    name: names[index],
  }));
};

const initialForm = (tenantId?: number) => ({
  bipardLocation: getInitialLocation(tenantId) as Option | null,
  locationList: [] as Option[],
  selectedLocation: null as Option | null,
  buildingTypeList: [] as Option[],
  selectedBuildingType: null as Option | null,
  buildingList: [] as Option[],
  selectedBuilding: null as Option | null,
  taskTypeList: [] as Option[],
  selectedTaskType: null as Option | null,
  taskTitle: '',
  staffList: [] as Option[],
  selectedStaff: [] as Option[],
  supportAdminList: [] as Option[],
  selectedSupportAdmin: [] as Option[],
  requiredSkills: '',
  description: '',
});

const AddHouseKeepingTask = ({ navigation, route }: Props) => {
  const item = route.params?.item;
  const isEdit = !!item;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const tenantId = crediantialData?.user?.[0]?.tenantId;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [addApi] = useHouseKeepingAddTaskMasterMutation();
  const [updateApi] = useHouseKeepingUpdateTaskMasterMutation();

  const [loader, setLoader] = useState(false);
  const [form, setForm] = useState(initialForm(tenantId));
  const [errors, setErrors] = useState<any>({});

  const setValue = <K extends keyof ReturnType<typeof initialForm>>(
    key: K,
    value: ReturnType<typeof initialForm>[K],
  ) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      isEdit ? 'Edit Housekeeping Task' : 'Add Housekeeping Task',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const fetchDropdown = useCallback(
    (params: any, key: keyof ReturnType<typeof initialForm>) => {
      setLoader(true);
      commonDropdownApi(params)
        .unwrap()
        .then((res: any) => {
          setValue(key, res.data || []);
          setLoader(false);
        })
        .catch((err: any) => {
          setLoader(false);
          Toast.show({
            type: 'error',
            text2: err?.data?.message || strings.something_went_wrong,
          });
        });
    },
    [commonDropdownApi],
  );

  const loadLocationScopedLists = useCallback(
    (centreId: any) => {
      if (!centreId) return;
      fetchDropdown(
        {
          listType: 'select_campus_location_for_house_keeping',
          bipardCentre: [centreId],
          replacements: ['%%'],
        },
        'locationList',
      );
      fetchDropdown(
        {
          listType: 'select_task_type_for_house_keeping_task_master',
          bipardCentre: [centreId],
          replacements: ['%%'],
        },
        'taskTypeList',
      );
      fetchDropdown(
        {
          listType: 'select_staff_for_house_keeping_task_master',
          bipardCentre: [centreId],
          replacements: ['%%'],
        },
        'staffList',
      );
      fetchDropdown(
        {
          listType: 'select_support_admin',
          bipardCentre: [centreId],
          replacements: ['%%'],
        },
        'supportAdminList',
      );
    },
    [fetchDropdown],
  );

  const loadBuildingType = useCallback(
    (centreId: any) => {
      if (!centreId) return;
      fetchDropdown(
        {
          listType: 'select_building_type_for_house_keeping',
          bipardCentre: [centreId],
          replacements: ['%%'],
        },
        'buildingTypeList',
      );
    },
    [fetchDropdown],
  );

  const loadBuildingList = useCallback(
    (centreId: any, buildingTypeId: any) => {
      if (!centreId || !buildingTypeId) return;
      fetchDropdown(
        {
          listType:
            buildingTypeId === 1
              ? 'select_hostel_name_for_bed_details'
              : 'select_other_building_for_house_keeping',
          bipardCentre: [centreId],
          replacements: ['%%'],
        },
        'buildingList',
      );
    },
    [fetchDropdown],
  );

  useEffect(() => {
    const centreId = form.bipardLocation?.id;
    if (centreId) {
      loadLocationScopedLists(centreId);
    }
  }, [form.bipardLocation?.id, loadLocationScopedLists]);

  useEffect(() => {
    if (!item) return;

    const bipardLocation = getInitialLocation(item?.tenantId);

    const selectedBuildingType = item?.buildingTypeId
      ? { id: item.buildingTypeId, name: item.buildingType }
      : null;

    setForm(prev => ({
      ...prev,
      bipardLocation,
      selectedLocation: item?.locationCampus
        ? { id: item.locationCampus, name: item.locationCampus }
        : null,
      selectedBuildingType,
      selectedBuilding: item?.buildingOrAreaId
        ? { id: item.buildingOrAreaId, name: item.buildingOrArea }
        : null,
      selectedTaskType: item?.taskTypeId
        ? { id: item.taskTypeId, name: item.taskType }
        : null,
      selectedStaff: namesToOptions(item?.staffId, item?.staffName),
      selectedSupportAdmin: namesToOptions(
        item?.supportAdminId,
        item?.supportAdminName,
      ),
      taskTitle: item?.taskTitle || '',
      requiredSkills: item?.requiredSkills || '',
      description: item?.taskDescription || '',
    }));

    if (bipardLocation?.id) {
      loadLocationScopedLists(bipardLocation.id);
      loadBuildingType(bipardLocation.id);
      if (selectedBuildingType?.id) {
        loadBuildingList(bipardLocation.id, selectedBuildingType.id);
      }
    }
  }, [item, loadBuildingList, loadBuildingType, loadLocationScopedLists]);

  const schema = Yup.object().shape({
    bipardLocation: Yup.object({
      name: Yup.string().required('BIPARD location is required'),
    })
      .nullable()
      .required('BIPARD location is required'),
    selectedLocation: Yup.object({
      id: Yup.string().required('Location is required'),
    })
      .nullable()
      .required('Location is required'),
    selectedTaskType: Yup.object({
      id: Yup.string().required('Task type is required'),
    })
      .nullable()
      .required('Task type is required'),
    selectedBuildingType:
      form.selectedLocation?.id === 'Inside BIPARD'
        ? Yup.object({
            id: Yup.string().required('Building type is required'),
          })
            .nullable()
            .required('Building type is required')
        : Yup.mixed().nullable(),
    selectedBuilding:
      form.selectedLocation?.id === 'Inside BIPARD'
        ? Yup.object({
            id: Yup.string().required('Building or area is required'),
          })
            .nullable()
            .required('Building or area is required')
        : Yup.mixed().nullable(),
    taskTitle: Yup.string().trim().required('Task title is required'),
    selectedStaff: Yup.array().min(1, 'Staff is required'),
    selectedSupportAdmin: Yup.array().min(1, 'Support admin is required'),
    requiredSkills: Yup.string().trim().required('Required skills is required'),
  });

  const validate = () => {
    try {
      schema.validateSync(form, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err: any) {
      const nextErrors: any = {};
      if (err?.inner?.length) {
        err.inner.forEach((validationErr: any) => {
          if (validationErr.path && !nextErrors[validationErr.path]) {
            nextErrors[validationErr.path] = validationErr.message;
          }
        });
      } else if (err?.path) {
        nextErrors[err.path] = err.message;
      }
      setErrors(nextErrors);
      return false;
    }
  };

  const handleSuccess = (res: any) => {
    route.params?.onDone?.();
    navigation.goBack();
    Toast.show({
      type: 'success',
      text2: res?.data?.message || (isEdit ? 'Task updated' : 'Task added'),
    });
    setLoader(false);
  };

  const handleError = (err: any) => {
    setLoader(false);
    Toast.show({
      type: 'error',
      text2: err?.data?.message || strings.something_went_wrong,
    });
  };

  const onSubmit = () => {
    if (!validate()) return;

    setLoader(true);
    const params: any = {
      id: isEdit ? item.id : null,
      bipardCentre: [form.bipardLocation?.id],
      locationCampus: form.selectedLocation?.id,
      taskType: form.selectedTaskType?.id,
      taskTitle: form.taskTitle.trim(),
      staffs: JSON.stringify(form.selectedStaff.map(staff => staff.id)),
      supportAdmins: JSON.stringify(
        form.selectedSupportAdmin.map(admin => admin.id),
      ),
      requiredSkills: form.requiredSkills.trim(),
      taskDescription: form.description,
    };

    if (form.selectedLocation?.id === 'Inside BIPARD') {
      params.buildingType = form.selectedBuildingType?.id;
    }
    if (form.selectedBuildingType?.id === 1) {
      params.hostelBuilding = form.selectedBuilding?.id;
    }
    if (form.selectedBuildingType?.id === 2) {
      params.otherBuilding = form.selectedBuilding?.id;
    }

    const request = isEdit ? updateApi(params) : addApi(params);
    request.unwrap().then(handleSuccess).catch(handleError);
  };

  const addUnique = (
    key: 'selectedStaff' | 'selectedSupportAdmin',
    option: Option,
  ) => {
    setForm(prev => {
      const current = prev[key];
      if (current.some(selected => selected.id === option.id)) return prev;
      return { ...prev, [key]: [...current, option] };
    });
  };

  const selectedNames = (items: Option[]) =>
    items.length ? items.map(selected => selected.name).join(', ') : undefined;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(120)}
      >
        <View style={globalStyles.adminFormCard}>
          <FormDropdownFieldWithTitle
            title="BIPARD Location"
            isMandatory
            data={locationOptions}
            value={form.bipardLocation?.id}
            placeholder="Select"
            disabled={tenantId !== 3}
            onChange={selected => {
              setForm(prev => ({
                ...prev,
                bipardLocation: selected as Option,
                selectedLocation: null,
                selectedBuildingType: null,
                selectedBuilding: null,
                selectedTaskType: null,
                selectedStaff: [],
                selectedSupportAdmin: [],
              }));
              setErrors((prev: any) => ({
                ...prev,
                bipardLocation: '',
                'bipardLocation.name': '',
              }));
            }}
            errorMessage={
              errors['bipardLocation.name'] || errors.bipardLocation
            }
          />

          <FormDropdownFieldWithTitle
            title="Location"
            isMandatory
            data={form.locationList}
            value={form.selectedLocation?.id}
            placeholder="Select"
            onChange={selected => {
              const nextLocation = selected as Option;
              setForm(prev => ({
                ...prev,
                selectedLocation: nextLocation,
                selectedBuildingType: null,
                selectedBuilding: null,
              }));
              if (nextLocation.id === 'Inside BIPARD') {
                loadBuildingType(form.bipardLocation?.id);
              }
              setErrors((prev: any) => ({
                ...prev,
                selectedLocation: '',
                'selectedLocation.id': '',
              }));
            }}
            errorMessage={
              errors['selectedLocation.id'] || errors.selectedLocation
            }
          />

          {form.selectedLocation?.id === 'Inside BIPARD' && (
            <FormDropdownFieldWithTitle
              title="Building Type"
              isMandatory
              data={form.buildingTypeList}
              value={form.selectedBuildingType?.id}
              placeholder="Select"
              onChange={selected => {
                const nextBuildingType = selected as Option;
                setForm(prev => ({
                  ...prev,
                  selectedBuildingType: nextBuildingType,
                  selectedBuilding: null,
                }));
                loadBuildingList(form.bipardLocation?.id, nextBuildingType.id);
                setErrors((prev: any) => ({
                  ...prev,
                  selectedBuildingType: '',
                  'selectedBuildingType.id': '',
                }));
              }}
              errorMessage={
                errors['selectedBuildingType.id'] || errors.selectedBuildingType
              }
            />
          )}

          {!!form.selectedBuildingType?.id && (
            <FormDropdownFieldWithTitle
              title={
                form.selectedBuildingType.id === 1
                  ? 'Hostel Building'
                  : 'Other Building'
              }
              isMandatory
              data={form.buildingList}
              value={form.selectedBuilding?.id}
              placeholder="Select"
              onChange={selected => {
                setValue('selectedBuilding', selected as Option);
                setErrors((prev: any) => ({
                  ...prev,
                  selectedBuilding: '',
                  'selectedBuilding.id': '',
                }));
              }}
              errorMessage={
                errors['selectedBuilding.id'] || errors.selectedBuilding
              }
            />
          )}

          <FormDropdownFieldWithTitle
            title="Task Type"
            isMandatory
            data={form.taskTypeList}
            value={form.selectedTaskType?.id}
            placeholder="Select"
            onChange={selected => {
              setValue('selectedTaskType', selected as Option);
              setErrors((prev: any) => ({
                ...prev,
                selectedTaskType: '',
                'selectedTaskType.id': '',
              }));
            }}
            errorMessage={
              errors['selectedTaskType.id'] || errors.selectedTaskType
            }
          />

          <FormTextInputWithTitle
            title="Task Title"
            isMandatory
            placeholder="Enter"
            value={form.taskTitle}
            returnKeyType="next"
            onChangeText={taskTitle => {
              setValue('taskTitle', taskTitle);
              setErrors((prev: any) => ({ ...prev, taskTitle: '' }));
            }}
            errorMessage={errors.taskTitle}
          />

          <FormDropdownFieldWithTitle
            title="Staff"
            isMandatory
            data={form.staffList}
            value={undefined}
            placeholder={selectedNames(form.selectedStaff) || 'Select'}
            onChange={selected => {
              addUnique('selectedStaff', selected as Option);
              setErrors((prev: any) => ({
                ...prev,
                selectedStaff: '',
              }));
            }}
            errorMessage={errors.selectedStaff}
          />

          <FormDropdownFieldWithTitle
            title="Support Admin"
            isMandatory
            data={form.supportAdminList}
            value={undefined}
            placeholder={selectedNames(form.selectedSupportAdmin) || 'Select'}
            onChange={selected => {
              addUnique('selectedSupportAdmin', selected as Option);
              setErrors((prev: any) => ({
                ...prev,
                selectedSupportAdmin: '',
              }));
            }}
            errorMessage={errors.selectedSupportAdmin}
          />

          <FormTextInputWithTitle
            title="Required Skills"
            isMandatory
            placeholder="Enter"
            value={form.requiredSkills}
            returnKeyType="next"
            onChangeText={requiredSkills => {
              setValue('requiredSkills', requiredSkills);
              setErrors((prev: any) => ({ ...prev, requiredSkills: '' }));
            }}
            errorMessage={errors.requiredSkills}
          />

          <FormTextInputWithTitle
            title="Description"
            placeholder="Enter"
            value={form.description}
            multiline
            inputStyle={styles.descriptionInput}
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={description => setValue('description', description)}
          />
        </View>
        <View style={styles.footerRow}>
          <FormWhiteButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            containerStyle={styles.footerButton}
            buttonStyle={styles.whiteButton}
          />
          <FormGradientButton
            title={isEdit ? 'Update' : 'Add'}
            onPress={onSubmit}
            loading={loader}
            containerStyle={styles.footerButton}
            buttonStyle={styles.gradientButton}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddHouseKeepingTask;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  scroll: {
    flex: 1,
  },
  contentScroll: {
    paddingHorizontal: vw(12),
    paddingTop: vh(10),
    paddingBottom: vh(40),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(12),
  },
  backIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.new_ui_heading,
    marginRight: vw(8),
  },
  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  descriptionInput: {
    minHeight: vh(86),
    textAlignVertical: 'top',
    paddingTop: vh(8),
  },
  footerRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerButton: {
    width: '48.5%',
  },
  whiteButton: {
    height: vh(40),
    borderRadius: vw(6),
    borderColor: colors.new_ui_heading,
  },
  gradientButton: {
    height: vh(40),
    borderRadius: vw(6),
  },
});
