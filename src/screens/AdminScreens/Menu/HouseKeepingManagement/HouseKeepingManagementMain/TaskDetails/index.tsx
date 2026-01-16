import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useAppSelector } from '../../../../../../hooks';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import {
  useHouseKeepingDeleteTaskAssignmentMutation,
  useHouseKeepingListTaskAssignmentMutation,
  useHouseKeepingUpdateTaskAssignmentMutation,
} from '../../../../../../injectEndpoints/houseKeepingManagementEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

interface Props {
  navigation: NavigationType;
}

const debounce = (func: any, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

interface FilterArgs {
  taskType?: any;
  taskTitle?: any;
  building?: any;
  priority?: any;
  status?: any;
  startDate?: any;
  endDate?: any;
}

interface ListPermissionProps {
  item: any;
  index: number;
  navigation: NavigationType;
  onDelete: (id: any) => void;
  onPriorityUpdate: (id: any, priorityId: any) => void;
  onStatusUpdate: (id: any, statusId: any) => void;
  priorityList: any[];
  statusList: any[];
  onRefresh: () => void;
}

const PRIORITY_COLORS: any = {
  High: {
    bg: '#F8C1C1',
    border: '#E57373',
    text: '#B71C1C',
  },
  Medium: {
    bg: '#FFE9A8',
    border: '#FFB300',
    text: '#8D6E00',
  },
  Low: {
    bg: '#D6E8F8',
    border: '#64B5F6',
    text: '#0D47A1',
  },
};

const STATUS_COLORS: any = {
  Completed: {
    bg: '#E1F5E1',
    border: '#66BB6A',
    text: '#2E7D32',
  },
  Pending: {
    bg: '#FFE9A8',
    border: '#FFB300',
    text: '#8D6E00',
  },
};

const StatusPriorityDropdown = ({
  label,
  value,
  list,
  colorMap,
  onSelect,
}: any) => {
  const [open, setOpen] = useState(false);

  const colorsSet = colorMap[value] || {
    bg: colors.lightGray2,
    border: colors.grey,
    text: colors.black,
  };

  return (
    <View style={{ marginTop: vh(5), zIndex: 999 }}>
      <TextAtom style={styles.label}>{label}</TextAtom>

      <TouchableAtom
        onPress={() => setOpen(!open)}
        style={[
          styles.statusBox,
          {
            backgroundColor: colorsSet.bg,
            borderColor: colorsSet.border,
          },
        ]}
      >
        <TextAtom style={[styles.statusText, { color: colorsSet.text }]}>
          {value}
        </TextAtom>
        <ImageAtom source={images.downArrow} />
      </TouchableAtom>

      {open && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => setOpen(false)}
          />

          <View style={styles.dropMenu}>
            {list.map((it: any) => (
              <TouchableAtom
                key={it.id}
                style={styles.dropItem}
                onPress={() => {
                  setOpen(false);
                  onSelect(it);
                }}
              >
                <TextAtom style={{ color: colors.black }}>{it.name}</TextAtom>
              </TouchableAtom>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

const ListPermissionCard = ({
  item,
  index,
  navigation,
  onDelete,
  onPriorityUpdate,
  onStatusUpdate,
  priorityList,
  statusList,
  onRefresh,
}: ListPermissionProps) => {
  const handleDelete = () => {
    navigation.navigate(screensName.AlertOrganism, {
      title: strings.guest.deleteConfirmation,
      message: strings.guest.deleteItemConfirmation,
      okText: strings.guest.confirm,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => onDelete(item.id),
      cancelFunction: () => {},
    });
  };

  const onChangePriority = (data: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Priority Change Confirmation',
      message: 'Are you sure you want to change priority this item?',
      okText: 'Confirm',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        onPriorityUpdate(item.id, data.id);
      },
    });
  };

  const onChangeStatus = (data: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Status Change Confirmation',
      message: 'Are you sure you want to change status this item?',
      okText: 'Confirm',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        onStatusUpdate(item.id, data.id);
      },
    });
  };

  return (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.TaskDetailDetails, {
          data: item,
        });
      }}
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>

        <View style={styles.actionRow}>
          <TouchableAtom
            style={styles.deleteButton}
            onPress={() => {
              navigation.navigate(screensName.TransferTask, {
                data: item,
                onDone: onRefresh,
              });
            }}
          >
            <ImageAtom source={images.transfer} style={styles.iconSmall} />
          </TouchableAtom>
          <TouchableAtom style={styles.deleteButton} onPress={handleDelete}>
            <ImageAtom source={images.delete} style={styles.iconSmall} />
          </TouchableAtom>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Staff Name'}</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {`${item.staffName}(${item.staffId})`}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Support Admin Name'}</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {`${item.supportAdminName}(${item.supportAdminId})`}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Task Type'}</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.taskType ?? '-'}
        </TextAtom>
      </View>
      <StatusPriorityDropdown
        label="Priority"
        value={item?.priority ?? null}
        list={priorityList}
        colorMap={PRIORITY_COLORS}
        onSelect={onChangePriority}
      />

      <StatusPriorityDropdown
        label="Status"
        value={item?.currentStatus ?? null}
        list={statusList}
        colorMap={STATUS_COLORS}
        onSelect={onChangeStatus}
      />
    </TouchableAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  taskTypeList: any[];
  selectedTaskType: any;
  setSelectedTaskType: (d: any) => void;
  taskTitle: any[];
  selectedTaskTitle: any;
  setSelectedTaskTitle: (d: any) => void;
  buildingList: any[];
  selectedBuilding: any;
  setSelectedBuilding: (d: any) => void;
  priorityList: any[];
  selectedPriority: any;
  setSelectedPriority: (d: any) => void;
  statusList: any[];
  selectedStatus: any;
  setSelectedStatus: (d: any) => void;
  startDate: any;
  setStartDate: (d: any) => void;
  endDate: any;
  setEndDate: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  getTaskTitle: (d: any) => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  taskTypeList,
  selectedTaskType,
  setSelectedTaskType,
  taskTitle,
  selectedTaskTitle,
  setSelectedTaskTitle,
  buildingList,
  selectedBuilding,
  setSelectedBuilding,
  priorityList,
  selectedPriority,
  setSelectedPriority,
  statusList,
  selectedStatus,
  setSelectedStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  getTaskTitle,
  applyFilter,
  clearFilter,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Task Type'}
      placeholder={'Task Type'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Task Type',
          Data: taskTypeList,
          selectedData: selectedTaskType,
          setSelectedData: (data: any) => {
            setSelectedTaskType(data);
            getTaskTitle(data.id);
            setSelectedTaskTitle({});
            hitFilterApi({ taskType: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedTaskType?.name}
    />
    <DropDownOrganism
      label={'Task Title'}
      placeholder={'Task Title'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Task Title',
          Data: taskTitle,
          selectedData: selectedTaskTitle,
          setSelectedData: (data: any) => {
            setSelectedTaskTitle(data);
            hitFilterApi({ taskTitle: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedTaskTitle?.name}
    />
    <DropDownOrganism
      label={'Building/Area'}
      placeholder={'Building/Area'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Building/Area',
          Data: buildingList,
          selectedData: selectedBuilding,
          setSelectedData: (data: any) => {
            setSelectedBuilding(data);
            hitFilterApi({ building: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedBuilding?.name}
    />
    <DropDownOrganism
      label={'Priority'}
      placeholder={'Priority'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Priority',
          Data: priorityList,
          selectedData: selectedPriority,
          setSelectedData: (data: any) => {
            setSelectedPriority(data);
            hitFilterApi({ priority: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedPriority?.name}
    />
    <DropDownOrganism
      label={'Status'}
      placeholder={'Status'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'PrioriStatusty',
          Data: statusList,
          selectedData: selectedStatus,
          setSelectedData: (data: any) => {
            setSelectedStatus(data);
            hitFilterApi({ status: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedStatus?.name}
    />
    <DateInputOrganism
      label="Start Date"
      placeholder="Start Date"
      value={startDate}
      onChangeText={(val: any) => {
        setStartDate(val);
        hitFilterApi({ startDate: val });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <DateInputOrganism
      label="End Date"
      placeholder="End Date"
      value={endDate}
      onChangeText={(val: any) => {
        setEndDate(val);
        hitFilterApi({ endDate: val });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />
    <ViewAtom style={styles.buttonRow}>
      <ButtonOrganism
        onPress={applyFilter}
        bttnText={strings.hostelManagement.bedAvailability.applyFilter}
        containerStyle={styles.applyBtn}
      />
      <ButtonOrganism
        onPress={clearFilter}
        bttnText={strings.hostelManagement.bedAvailability.clearFilter}
        containerStyle={styles.clearBtn}
        bttnTextStyle={{ color: colors.primary }}
      />
    </ViewAtom>
  </View>
);

const BedItemSeparator = () => <View style={styles.itemSeparator} />;

const TaskDetails = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listReportFacultyApi] = useHouseKeepingListTaskAssignmentMutation();
  const [deleteResponseApi] = useHouseKeepingDeleteTaskAssignmentMutation();
  const [updateResponseApi] = useHouseKeepingUpdateTaskAssignmentMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [taskTypeList, setTaskTypeList] = useState<any>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<any>([]);

  const [taskTitle, setTaskTitle] = useState<any>([]);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState<any>({});

  const [buildingList, setBuildingList] = useState<any>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<any>({});

  const [priorityList, setPriorityList] = useState<any>([]);
  const [selectedPriority, setSelectedPriority] = useState<any>({});

  const [statusList, setStatusList] = useState<any>([]);
  const [selectedStatus, setSelectedStatus] = useState<any>({});

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Task Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);

        listReportFaculty(1, true, search, []);
        getTaskType();
        getBuilding();
        getPriority();
        getStatus();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listReportFaculty(1, true, '');
    getTaskType();
    getBuilding();
    getPriority();
    getStatus();
    clearFilter();
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listReportFaculty = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
    extraParams: any = {},
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);
    const centreFilter = getCentreFilter();
    const params: any = {
      search: keyword,
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      ...extraParams,
    };
    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }
    listReportFacultyApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        if (pageNumber !== 1 && data.length > 0) {
          setData((prev: any) => [...prev, ...newData]);
        } else {
          setData(newData);
        }
        if (res?.data?.exportUrlExcel) {
          downloadAndOpenFile(res.data.exportUrlExcel);
        }
        setPage(pageNumber);

        const totalCount = res?.data?.totalCount ?? 0;
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      listReportFaculty(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listReportFaculty(1, true, '');
  };

  const deleteResponse = (id: any) => {
    setInitialCall(true);
    deleteResponseApi({ id: id })
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: 'success', text2: res.data.message });
        setInitialCall(false);
        setFirstTimeLoad(true);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const clearFilter = () => {
    setSelectedTaskType({});
    setSelectedTaskTitle({});
    setSelectedBuilding({});
    setSelectedPriority({});
    setSelectedStatus({});
    setStartDate('');
    setEndDate('');
    listReportFaculty(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any[] = [];

    if (selectedTaskType?.id) {
      filters.push(['taskTypeId', '=', selectedTaskType.id]);
    }

    if (selectedTaskTitle?.id) {
      filters.push(['taskTitleId', '=', selectedTaskTitle.id]);
    }

    if (selectedBuilding?.id) {
      filters.push(['buildingOrAreaId', '=', selectedBuilding.id]);
    }

    if (selectedPriority?.id) {
      filters.push(['priorityId', '=', selectedPriority.id]);
    }

    if (selectedStatus?.id) {
      filters.push(['currentStatusId', '=', selectedStatus.id]);
    }

    if (startDate) {
      const sd = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['startDate', '>=', sd]);
    }

    if (endDate) {
      const ed = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['endDate', '<=', ed]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    listReportFaculty(1, true, search, filters);
  };

  const hitFilterApi = ({
    taskType = selectedTaskType,
    taskTitle = selectedTaskTitle,
    building = selectedBuilding,
    priority = selectedPriority,
    status = selectedStatus,
    startDate: sDate = startDate,
    endDate: eDate = endDate,
  }: FilterArgs = {}) => {
    const filters: any[] = [];
    if (taskType?.id) {
      filters.push(['taskTypeId', '=', taskType.id]);
    }

    if (taskTitle?.id) {
      filters.push(['taskTitleId', '=', taskTitle.id]);
    }

    if (building?.id) {
      filters.push(['buildingOrAreaId', '=', building.id]);
    }

    if (priority?.id) {
      filters.push(['priorityId', '=', priority.id]);
    }

    if (status?.id) {
      filters.push(['currentStatusId', '=', status.id]);
    }

    if (sDate) {
      const sd = moment(sDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['startDate', '>=', sd]);
    }

    if (eDate) {
      const ed = moment(eDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['endDate', '<=', ed]);
    }

    listReportFaculty(1, true, search, filters);
  };

  const onPriorityUpdate = (id: any, priorityId: any) => {
    setInitialCall(true);
    updateResponseApi({ id: id, priority: priorityId })
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: 'success', text2: res.data.message });
        setInitialCall(false);
        setFirstTimeLoad(true);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const onStatusUpdate = (id: any, statusId: any) => {
    setInitialCall(true);
    updateResponseApi({ id: id, currentStatus: statusId })
      .unwrap()
      .then((res: any) => {
        Toast.show({ type: 'success', text2: res.data.message });
        setInitialCall(false);
        setFirstTimeLoad(true);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const renderListPermissionDetails = ({ item, index }: any) => (
    <ListPermissionCard
      item={item}
      index={index}
      navigation={navigation}
      onDelete={deleteResponse}
      onPriorityUpdate={onPriorityUpdate}
      onStatusUpdate={onStatusUpdate}
      priorityList={priorityList}
      statusList={statusList}
      onRefresh={() => listReportFaculty(1, true, search)}
    />
  );

  const downloadPdf = () => {
    const filters = buildFilters();

    listReportFaculty(1, true, search, filters, {
      exportFlagExcel: true,
    });
  };

  const getTaskType = () => {
    setInitialCall(true);
    const params = {
      listType: 'task_type_filters_for_house_keeping',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setTaskTypeList(res.data);

        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const getTaskTitle = (id: any) => {
    setInitialCall(true);
    const params = {
      listType: 'task_title_filters_for_house_keeping',
      bipardCentre: getCentreFilter(),
      replacements: ['%%', id],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setTaskTitle(res.data);

        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };
  const getBuilding = () => {
    setInitialCall(true);
    const params = {
      listType: 'building_or_area_filters_for_house_keeping',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setBuildingList(res.data);

        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };
  const getPriority = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_priority_for_house_keeping',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setPriorityList(res.data);

        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };
  const getStatus = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_current_status_for_house_keeping',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setStatusList(res.data);

        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View
        style={{
          flexDirection: 'row',
          alignSelf: 'flex-end',
        }}
      >
        <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
          <TextAtom style={styles.filterText}>
            {showFilter
              ? strings.hostelManagement.bedAvailability.hideFilter
              : strings.hostelManagement.bedAvailability.showFilter}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            downloadPdf();
          }}
        >
          <ImageAtom
            source={images.download}
            style={{ tintColor: colors.black }}
          />
        </TouchableAtom>
      </View>
      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.dashboardIndex.centers}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: strings.dashboardIndex.center,
              Data: [
                {
                  id: strings.dashboardIndex.allCenters,
                  name: strings.dashboardIndex.allCenters,
                },
                {
                  id: strings.dashboardIndex.gaya,
                  name: strings.dashboardIndex.gaya,
                },
                {
                  id: strings.dashboardIndex.patna,
                  name: strings.dashboardIndex.patna,
                },
              ],
              selectedData: centerSerach,
              setSelectedData: (data: any) => {
                setCenterSerach(data);
              },
              typeName: 'name',
              typeId: 'id',
            });
          }}
          inputText={centerSerach?.name}
          containerStyle={{ marginBottom: vh(-10) }}
        />
      )}

      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListPermissionDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.hostelManagement.noDataFound}
            </TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={styles.loadingContainer}
          />
        }
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              hitFilterApi={hitFilterApi}
              taskTypeList={taskTypeList}
              selectedTaskType={selectedTaskType}
              setSelectedTaskType={setSelectedTaskType}
              taskTitle={taskTitle}
              selectedTaskTitle={selectedTaskTitle}
              setSelectedTaskTitle={setSelectedTaskTitle}
              buildingList={buildingList}
              selectedBuilding={selectedBuilding}
              setSelectedBuilding={setSelectedBuilding}
              priorityList={priorityList}
              selectedPriority={selectedPriority}
              setSelectedPriority={setSelectedPriority}
              statusList={statusList}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              getTaskTitle={getTaskTitle}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listReportFaculty(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listReportFaculty(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={BedItemSeparator}
      />
    </SafeAreaView>
  );
};

export default TaskDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  labelRight: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    textAlign: 'right',
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginVertical: vh(5),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
    backgroundColor: colors.lightGray2,
    borderRadius: 8,
    marginTop: 6,
  },
  statusBox: {
    marginTop: vh(8),
    paddingVertical: vh(8),
    paddingHorizontal: vw(12),
    borderRadius: vw(6),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  activeBox: {
    backgroundColor: colors.lightGreenBg,
    borderColor: colors.darkGreen,
  },

  inActiveBox: {
    backgroundColor: colors.pharmacy_yellow,
    borderColor: colors.warningOrange,
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },

  activeText: { color: colors.greenText },
  inActiveText: { color: colors.redText },

  dropMenu: {
    marginTop: vh(6),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grey,
    borderRadius: vw(6),
    overflow: 'hidden',
    zIndex: 999,
  },

  dropItem: {
    paddingVertical: vh(10),
    paddingHorizontal: vw(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.chinese_silver,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  filterButton: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginTop: vh(10),
    alignSelf: 'flex-end',
    marginRight: vh(15),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },
  filterText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  filterContainer: { paddingHorizontal: vw(15) },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(10),
  },

  // New StyleSheet Entries
  flex1: { flex: 1 },
  flex1End: { flex: 1, alignItems: 'flex-end' },
  actionRow: { flexDirection: 'row', gap: vw(15) },
  editButton: {
    borderWidth: vw(1),
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    tintColor: colors.green,
    width: vw(15),
    height: vw(15),
  },
  deleteButton: {
    borderWidth: vw(1),
    borderColor: colors.red_2,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmall: { width: vw(15), height: vw(15), tintColor: colors.primary },
  statusContainer: { marginTop: vh(0), zIndex: 999 },
  statusTextBlack: { color: colors.black },
  loadingContainer: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
  marginBottomNegative: { marginBottom: vh(-10) },
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  editBtn: {
    borderWidth: vw(1),
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSm: {
    tintColor: colors.green,
    width: vw(15),
    height: vw(15),
  },
  deleteBtn: {
    borderWidth: vw(1),
    borderColor: colors.red_2,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSmDelete: {
    width: vw(15),
    height: vw(15),
  },
});
