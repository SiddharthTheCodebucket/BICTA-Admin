import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Linking,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

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

import {
  useHrmsDeleteLeaveRequestMutation,
  useHrmsListLeaveBalanceMutation,
  useHrmsListLeaveRequestMutation,
} from '../../../../../../injectEndpoints/hrmsEndpoints';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import moment from 'moment';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';

interface Props {
  navigation: NavigationType;
  route: any;
}

interface LeaveCardProps {
  leaveSummary: any[];
}

const LeaveCard = ({ leaveSummary }: LeaveCardProps) => {
  return (
    <View style={styles.card}>
      <TextAtom style={styles.cardTitle}>Leave Balance</TextAtom>
      <View style={[styles.row, styles.tableHeader]}>
        <TextAtom style={[styles.headerText, styles.flex2]}>
          Leave Type
        </TextAtom>
        <TextAtom style={styles.headerText}>Credited</TextAtom>
        <TextAtom style={styles.headerText}>Taken</TextAtom>
        <TextAtom style={styles.headerText}>Remaining</TextAtom>
      </View>

      {leaveSummary.map((item, index) => (
        <View key={index.toString() + 'leave summary'} style={styles.row}>
          <TextAtom style={[styles.cellText, styles.flex2]}>
            {item.leaveTypeName}
          </TextAtom>
          <TextAtom style={styles.cellText}>{item.credited}</TextAtom>
          <TextAtom style={styles.cellText}>{item.taken}</TextAtom>
          <TextAtom style={[styles.cellText]}>{item.remaining}</TextAtom>
        </View>
      ))}
    </View>
  );
};

interface LeaveRequestCardProps {
  item: any;
  index: number;
  onDelete: (id: any) => void;
  navigation: NavigationType;
}

const LeaveRequestCard = React.memo(
  ({ item, index, onDelete, navigation }: LeaveRequestCardProps) => {
    const confirmDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.bedDetails.deleteConfirmation,
        message: strings.hostelManagement.bedDetails.deleteMessage,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => onDelete(item.id),
        cancelFunction: () => {},
      });
    };
    return (
      <View style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>

          <View style={styles.actionRow}>
            <TouchableAtom
              style={[styles.editBtn, { borderColor: colors.red }]}
              onPress={confirmDelete}
            >
              <ImageAtom source={images.delete} style={styles.editIcon} />
            </TouchableAtom>
          </View>
        </View>

        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Leave Type</TextAtom>
            <TextAtom style={styles.value}>{item.leaveTypeName}</TextAtom>
          </View>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.labelRight}>Leave Date</TextAtom>
            <TextAtom style={styles.valueRight}>
              {moment(item.leaveDate).format('DD-MM-YYYY')}
            </TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Session</TextAtom>
            <TextAtom style={styles.value}>{item.leaveSession}</TextAtom>
          </View>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.labelRight}>Days</TextAtom>
            <TextAtom style={styles.valueRight}>{item.leaveDays}</TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Status</TextAtom>
            <TextAtom
              style={[
                styles.value,
                item.approvalStatus === 'Approved' && { color: colors.green },
                item.approvalStatus === 'Rejected' && { color: colors.red },
                item.approvalStatus === 'Pending' && {
                  color: colors.warningOrange,
                },
              ]}
            >
              {item.approvalStatus}
            </TextAtom>
          </View>
          <View style={{ flex: 1 }}>
            <TouchableAtom
              disabled={!item?.attachment}
              onPress={() => {
                if (item?.attachment) {
                  Linking.openURL(item.attachment);
                }
              }}
            >
              <TextAtom style={styles.labelRight}>Attachement</TextAtom>
              <TextAtom style={[styles.valueRight, { color: colors.primary }]}>
                {item.attachment ? 'view' : '-'}
              </TextAtom>
            </TouchableAtom>
          </View>
        </View>
      </View>
    );
  },
);

interface FilterFormProps {
  navigation: NavigationType;
  startDate: any;
  setStartDate: (v: any) => void;
  endDate: any;
  setEndDate: (v: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
}

const FilterForm = ({
  navigation,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilter,
  clearFilter,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DateInputOrganism
      label={strings.hostelReport.startDate}
      placeholder={strings.hostelReport.startDate}
      value={startDate}
      onChangeText={setStartDate}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />
    <DateInputOrganism
      label={strings.hostelReport.endDate}
      placeholder={strings.hostelReport.endDate}
      value={endDate}
      onChangeText={setEndDate}
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
const FloorItemSeparator = () => <View style={styles.itemSeparator} />;
const LeaveHistoryDetails = ({ navigation, route }: Props) => {
  const [leaveBalanceApi] = useHrmsListLeaveBalanceMutation();
  const [leaveRequestApi] = useHrmsListLeaveRequestMutation();
  const [leaveDeleteApi] = useHrmsDeleteLeaveRequestMutation();

  const employeeId = route?.params?.employeeId;

  const [leaveSummary, setLeaveSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState<any[]>([]);

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Leave History Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  useEffect(() => {
    fetchLeaveBalance();
    fetchLeaveRequest(1, true);
  }, []);

  useEffect(() => {
    if (!startDate && !endDate) {
      setAppliedFilters([]);
      fetchLeaveRequest(1, true, []);
      return;
    }

    const filters = buildFilters();
    setAppliedFilters(filters);
    fetchLeaveRequest(1, true, filters);
  }, [startDate, endDate]);

  const fetchLeaveBalance = () => {
    setLoading(true);

    const params = {
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: 1,
      itemsPerPage: 30,
      employeeId,
    };

    leaveBalanceApi(params)
      .unwrap()
      .then((res: any) => {
        const employee = res?.data?.data?.[0];
        setLeaveSummary(employee?.leaveSummary || []);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const fetchLeaveRequest = (
    pageNumber: number,
    isRefresh = false,
    extraFilters: any[] = [],
  ) => {
    isRefresh ? setRefreshing(true) : setPagination(true);

    const params = {
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [['employeeId', '=', employeeId], ...extraFilters],
      pageNo: pageNumber,
      itemsPerPage: 10,
    };

    leaveRequestApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res?.data?.data ?? [];
        const totalCount = res?.data?.totalCount ?? 0;

        setLeaveRequests(prev =>
          pageNumber === 1 ? newData : [...prev, ...newData],
        );

        setNextPageAvailable(pageNumber * 10 < totalCount);
        setPage(pageNumber);
      })
      .catch(() => {
        Toast.show({
          type: 'error',
          text2: strings.something_went_wrong,
        });
      })
      .finally(() => {
        setPagination(false);
        setRefreshing(false);
      });
  };

  const renderContent = () => {
    if (leaveSummary.length > 0) {
      return (
        <View style={{ marginTop: vh(10) }}>
          <LeaveCard leaveSummary={leaveSummary} />
        </View>
      );
    }

    if (!loading) {
      return <TextAtom style={styles.emptyText}>No leave data found</TextAtom>;
    }

    return null;
  };

  const handleLoadMore = () => {
    if (!pagination && nextPageAvailable) {
      fetchLeaveRequest(page + 1, false, appliedFilters);
    }
  };

  const handleDeleteLeaveRequest = (id: any) => {
    setLoading(true);

    leaveDeleteApi({ requestId: id })
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message || 'Leave deleted successfully',
        });
        fetchLeaveRequest(1, true);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Unable to delete leave',
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderLeaveRequestList = () => {
    return (
      <FlatList
        data={leaveRequests}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <LeaveRequestCard
            item={item}
            index={index}
            navigation={navigation}
            onDelete={handleDeleteLeaveRequest}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.primary}
            colors={[colors.primary]}
            onRefresh={() => {
              setRefreshing(true);
              fetchLeaveRequest(1, false);
            }}
          />
        }
        ListFooterComponent={
          pagination && nextPageAvailable ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginVertical: vh(10) }}
            />
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={FloorItemSeparator}
        contentContainerStyle={{ paddingBottom: vh(30) }}
      />
    );
  };

  const buildFilters = () => {
    const filters: any[] = [];

    if (startDate) {
      filters.push([
        'leaveDate',
        '>=',
        moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    if (endDate) {
      filters.push([
        'leaveDate',
        '<=',
        moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    setAppliedFilters(filters);
    setPage(1);
    fetchLeaveRequest(1, true, filters);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedFilters([]);
    setPage(1);
    fetchLeaveRequest(1, true, []);
  };

  const renderLeaveRequestContent = () => {
    if (leaveRequests.length > 0) {
      return renderLeaveRequestList();
    }

    if (!loading) {
      return (
        <TextAtom style={styles.emptyText}>No leave request found</TextAtom>
      );
    }

    return null;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loading} />
      <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
        <TextAtom style={styles.filterText}>
          {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
        </TextAtom>
      </TouchableAtom>
      {showFilter ? (
        <FilterForm
          navigation={navigation}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      ) : null}
      {renderContent()}
      {!loading && (
        <TextAtom style={styles.sectionTitle}>Leave Requests</TextAtom>
      )}
      {renderLeaveRequestContent()}
    </SafeAreaView>
  );
};

export default LeaveHistoryDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  listContainer: {
    padding: vw(15),
  },

  employeeHeader: {
    backgroundColor: colors.white,
    margin: vw(15),
    padding: vw(15),
    borderRadius: vw(10),
    elevation: 2,
  },

  employeeName: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.black,
  },

  vendorName: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.grey,
    marginTop: vh(4),
  },
  leaveType: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(15),
    color: colors.black,
    marginBottom: vh(10),
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  valueBox: {
    flex: 1,
    alignItems: 'center',
  },

  zeroValue: {
    color: colors.red,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(40),
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
  },
  cardTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.black,
    marginBottom: vh(12),
  },

  row: {
    flexDirection: 'row',
    paddingVertical: vh(10),
    borderBottomWidth: 1,
    borderColor: colors.grey_1,
    alignItems: 'center',
  },

  tableHeader: {
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
  },

  headerText: {
    flex: 1,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.black,
    textAlign: 'center',
  },

  cellText: {
    flex: 1,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.grey,
    textAlign: 'center',
  },

  flex2: {
    flex: 2,
    textAlign: 'left',
  },

  sectionTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    marginHorizontal: vw(15),
    marginBottom: vh(10),
    color: colors.black,
    marginTop: vh(10),
  },
  actionRow: {
    flexDirection: 'row',
    gap: vw(15),
  },

  editBtn: {
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: vw(6),
    padding: vw(3),
  },

  editIcon: {
    tintColor: colors.red,
    width: vw(15),
    height: vw(15),
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
    marginTop: vh(5),
  },
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  itemSeparator: {
    height: vh(10),
  },
});
