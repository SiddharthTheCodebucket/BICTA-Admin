import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
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
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import moment from 'moment';
import {
  useHrmsAssignApprovalOfficerMutation,
  useHrmsListLeaveRequestMutation,
  useHrmsUpdateLeaveRequestMutation,
} from '../../../../../../injectEndpoints/hrmsEndpoints';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';
import ApproveRejectModal from './ApproveRejectModal';

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

interface ListPermissionProps {
  item: any;
  index: number;
  navigation: NavigationType;
  onApproveReject: (item: any, status: 'Approved' | 'Rejected') => void;
  onRefresh: () => void;
  recommendedList: any[];
  recommendedMap: any;
  setRecommendedMap: (d: any) => void;
  hitRecommanded: (data: any, item: any) => void;
}
const ListPermissionCard = ({
  item,
  index,
  navigation,
  onApproveReject,
  onRefresh,
  recommendedList,
  recommendedMap,
  setRecommendedMap,
  hitRecommanded,
}: ListPermissionProps) => {
  return (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.LeaveApprovalDetails, { data: item });
      }}
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>

        <View style={styles.actionRow}>
          <TouchableAtom
            style={styles.editButton}
            onPress={() =>
              navigation.navigate(screensName.TrackRecords, {
                item: item,
                onDone: onRefresh,
              })
            }
          >
            <ImageAtom source={images.eyeOpen} style={styles.editIcon} />
          </TouchableAtom>
          {item.approvalStatus === 'Pending' && (
            <>
              <TouchableAtom
                style={styles.approveButton}
                onPress={() => onApproveReject(item, 'Approved')}
                activeOpacity={0.8}
              >
                <ImageAtom source={images.tick} style={styles.actionIcon} />
              </TouchableAtom>

              <TouchableAtom
                style={styles.rejectButton}
                onPress={() => onApproveReject(item, 'Rejected')}
                activeOpacity={0.8}
              >
                <ImageAtom source={images.cross} style={styles.actionIcon} />
              </TouchableAtom>
            </>
          )}
        </View>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Employee Name'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {`${item.employeeName}${item.employeeId}`}
          </TextAtom>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>{'Vendor Name'}</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.vendorName ?? '-'}
        </TextAtom>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Leave Type'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.leaveTypeName ?? '-'}
          </TextAtom>
        </View>
        <View style={{ flex: 1, alignSelf: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Leave Date'}</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {moment(item.leaveDate).format('DD-MM-YYYY') ?? '-'}
          </TextAtom>
        </View>
      </View>
      <DropDownOrganism
        label=""
        placeholder="Recommended To"
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Recommended To',
            Data: recommendedList,
            selectedData: recommendedMap[item.id] || {},
            setSelectedData: (data: any) => {
              setRecommendedMap((prev: any) => ({
                ...prev,
                [item.id]: data,
              }));

              setTimeout(() => {
                hitRecommanded(data, item);
              }, 0);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={recommendedMap[item.id]?.name || item.approvalOfficerName}
        containerStyle={{ width: vw(250), alignSelf: 'center' }}
        contentContainerStyle={{ width: vw(300), alignSelf: 'center' }}
        downArrowStyle={{ marginLeft: vh(-100) }}
      />
    </TouchableAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  leaveStatusList: any[];
  selectedLeaveStatus: any;
  setSelectedLeaveStatus: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  leaveStatusList,
  selectedLeaveStatus,
  setSelectedLeaveStatus,
  applyFilter,
  clearFilter,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Leave Status'}
      placeholder={'Leave Status'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Leave Status',
          Data: leaveStatusList,
          selectedData: selectedLeaveStatus,
          setSelectedData: (data: any) => {
            setSelectedLeaveStatus(data);
            hitFilterApi({ mess: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedLeaveStatus?.name}
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

const LeaveApproval = (props: Props) => {
  const { navigation } = props;

  let center = useGetCentre();
  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listApi] = useHrmsListLeaveRequestMutation();
  const [updateApi] = useHrmsUpdateLeaveRequestMutation();
  const [approvalOfficerApi] = useHrmsAssignApprovalOfficerMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [leaveStatusList, setLeaveStatusList] = useState<any>([]);
  const [selectedLeaveStatus, setSelectedLeaveStatus] = useState<any>({});

  const [recommendedList, setRecommendedList] = useState<any>([]);
  const [recommendedMap, setRecommendedMap] = useState<{ [key: number]: any }>(
    {},
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState<
    'Approved' | 'Rejected' | null
  >(null);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Employee List For Approval');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && search === '') {
        setFirstTimeLoad(false);

        list(1, true, search, []);
        getLeaveStatusList();
        getRecommendedList();
      }
    }, [firstTimeLoad, search]),
  );

  const list = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
    extraParams: any = {},
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      ...extraParams,
    };

    listApi(params)
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
        setPage(pageNumber);
        if (res.data.exportUrlExcel) {
          downloadAndOpenFile(res.data.exportUrlExcel);
        }
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
      list(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    list(1, true, '');
  };

  const openApproveRejectModal = (
    item: any,
    status: 'Approved' | 'Rejected',
  ) => {
    setSelectedItem(item);
    setApprovalStatus(status);
    setShowModal(true);
  };

  const submitApproval = (remark: string) => {
    const payload = {
      requestId: selectedItem.id,
      approvalStatus,
      approvalRemark: remark,
    };

    setInitialCall(true);

    updateApi(payload)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message || `Leave ${approvalStatus} successfully`,
        });
        setShowModal(false);
        list(1, true, search);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      })
      .finally(() => setInitialCall(false));
  };

  const hitRecommanded = (data: any, item: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Assign Approval Officer Confirmation',
      message: 'Are you sure you want to assign approval officer?',
      okText: strings.ok,
      cancelText: strings.cancel,
      double: true,
      okFunction: () => assignApprovalOfficer(data, item),
      cancelFunction: () => {},
    });
  };

  const renderListPermissionDetails = ({ item, index }: any) => (
    <ListPermissionCard
      item={item}
      index={index}
      navigation={navigation}
      onApproveReject={openApproveRejectModal}
      onRefresh={() => list(1, true, search)}
      recommendedList={recommendedList}
      recommendedMap={recommendedMap}
      setRecommendedMap={setRecommendedMap}
      hitRecommanded={hitRecommanded}
    />
  );

  const clearFilter = () => {
    setSelectedLeaveStatus({});
    list(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any[] = [];

    if (selectedLeaveStatus?.id) {
      filters.push(['approvalStatus', '=', selectedLeaveStatus.id]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    list(1, true, search, filters);
    setShowFilter(false);
  };

  const getLeaveStatusList = () => {
    setInitialCall(true);
    const params = {
      listType: 'get_leave_approval_status',
      bipardCentre: center,
      replacements: [],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];

        setLeaveStatusList(resData);
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

  const getRecommendedList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_approval_officer',
      bipardCentre: center,
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];

        setRecommendedList(resData);
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

  const hitFilterApi = ({ leaveStatus = selectedLeaveStatus }: any = {}) => {
    const filters: any[] = [];

    if (leaveStatus?.id) {
      filters.push(['approvalStatus', '=', [leaveStatus.id]]);
    }

    list(1, true, search, filters);
  };

  const assignApprovalOfficer = (data: any, item: any) => {
    const payload = {
      requestId: item.id,
      approvalOfficer: data.id,
    };

    setInitialCall(true);

    approvalOfficerApi(payload)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message || 'Approval officer assigned successfully',
        });
        list(1, true, search);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
        setRecommendedMap(prev => {
          const updated = { ...prev };
          delete updated[item.id];
          return updated;
        });
      })
      .finally(() => setInitialCall(false));
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
      </View>

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
              leaveStatusList={leaveStatusList}
              selectedLeaveStatus={selectedLeaveStatus}
              setSelectedLeaveStatus={setSelectedLeaveStatus}
              hitFilterApi={hitFilterApi}
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
              list(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? list(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={BedItemSeparator}
      />
      <ApproveRejectModal
        visible={showModal}
        status={approvalStatus}
        onClose={() => setShowModal(false)}
        onSubmit={submitApproval}
      />
    </SafeAreaView>
  );
};

export default LeaveApproval;

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
    maxHeight: vh(160), // ✅ FIX HEIGHT
    overflow: 'hidden',
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
  iconSmall: { width: vw(15), height: vw(15) },
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
  approveButton: {
    backgroundColor: colors.green,
    borderWidth: vw(1),
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(4),
  },

  rejectButton: {
    borderColor: colors.red,
    backgroundColor: colors.red,
    borderWidth: vw(1),
    borderRadius: vw(6),
    padding: vw(4),
  },

  actionIcon: {
    width: vw(14),
    height: vw(14),
    tintColor: colors.white,
  },
});
