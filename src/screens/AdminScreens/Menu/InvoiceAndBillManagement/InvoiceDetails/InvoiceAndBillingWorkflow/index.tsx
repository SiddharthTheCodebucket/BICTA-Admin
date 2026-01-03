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
import { useVendorListMutation } from '../../../../../../injectEndpoints/dashboardEndpoints';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';

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

interface VendorCardProps {
  item: any;
  index: number;
  navigation: any;
  onPressAssign: () => void;
  onPressReAssign: () => void;
}

const VendorCard: React.FC<VendorCardProps> = ({
  item,
  index,
  navigation,
  onPressAssign,
  onPressReAssign,
}) => {
  return (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.InvoiceDetailDetails, { data: item });
      }}
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, { flex: 1 }]}>
          Sr. No: {index + 1}
        </TextAtom>
        <View style={{ flexDirection: 'row', gap: vw(10) }}>
          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              borderRadius: vw(4),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              navigation.navigate(screensName.Movement, {
                item: item,
              });
            }}
          >
            <ImageAtom
              source={images.eyeOpen}
              style={{
                tintColor: colors.primary,
                width: vw(15),
                height: vw(15),
              }}
            />
          </TouchableAtom>

          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              borderRadius: vw(4),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              onPressAssign();
            }}
          >
            <ImageAtom
              source={images.assign}
              style={{
                width: vw(15),
                height: vw(15),
                tintColor: colors.primary,
              }}
            />
          </TouchableAtom>
          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              borderRadius: vw(4),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              onPressReAssign();
            }}
          >
            <ImageAtom
              source={images.reassign}
              style={{
                width: vw(15),
                height: vw(15),
                tintColor: colors.primary,
              }}
            />
          </TouchableAtom>
          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              borderRadius: vw(4),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {}}
          >
            <ImageAtom
              source={images.payment}
              style={{
                width: vw(15),
                height: vw(15),
                tintColor: colors.primary,
              }}
            />
          </TouchableAtom>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Vendor Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.vendorName ?? '-'}
        </TextAtom>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Unique Id</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.uniqueId ?? '-'}
        </TextAtom>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Subject</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.subject ?? '-'}
        </TextAtom>
      </View>
    </TouchableAtom>
  );
};

interface FilterFormProps {
  navigation: any;

  selectedLocation: any;
  setSelectedLocation: (data: any) => void;

  selectedCurrentStatus: any;
  setSelectedCurrentStatus: (data: any) => void;

  selectedPaymentStatus: any;
  setSelectedPaymentStatus: (data: any) => void;

  selectedAssignedTo: any;
  setSelectedAssignedTo: (data: any) => void;

  currentStatusList: any[];
  assignedToList: any[];

  startDate: string;
  setStartDate: (val: string) => void;

  endDate: string;
  setEndDate: (val: string) => void;

  applyFilter: () => void;
  clearFilter: () => void;
  generateReport: () => void;
}

const FilterForm: React.FC<FilterFormProps> = ({
  navigation,
  selectedLocation,
  setSelectedLocation,
  selectedCurrentStatus,
  setSelectedCurrentStatus,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  selectedAssignedTo,
  setSelectedAssignedTo,
  currentStatusList,
  assignedToList,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilter,
  clearFilter,
  generateReport,
}) => {
  return (
    <View style={styles.filterContainer}>
      {/* Location */}
      <DropDownOrganism
        label="Location"
        placeholder="Location"
        onPress={() =>
          navigation.navigate('DropDownModal', {
            name: 'Location',
            Data: [
              { id: 'Gaya', name: 'Gaya' },
              { id: 'Patna', name: 'Patna' },
            ],
            selectedData: selectedLocation,
            setSelectedData: setSelectedLocation,
            typeName: 'name',
            typeId: 'id',
          })
        }
        inputText={selectedLocation?.name}
      />

      {/* Current Status */}
      <DropDownOrganism
        label="Current Status"
        placeholder="Current Status"
        onPress={() =>
          navigation.navigate('DropDownModal', {
            name: 'Current Status',
            Data: currentStatusList,
            selectedData: selectedCurrentStatus,
            setSelectedData: setSelectedCurrentStatus,
            typeName: 'name',
            typeId: 'id',
          })
        }
        inputText={selectedCurrentStatus?.name}
      />

      {/* Payment Status */}
      <DropDownOrganism
        label="Payment Status"
        placeholder="Payment Status"
        onPress={() =>
          navigation.navigate('DropDownModal', {
            name: 'Payment Status',
            Data: [
              { id: 'Yes', name: 'Yes' },
              { id: 'No', name: 'No' },
            ],
            selectedData: selectedPaymentStatus,
            setSelectedData: setSelectedPaymentStatus,
            typeName: 'name',
            typeId: 'id',
          })
        }
        inputText={selectedPaymentStatus?.name}
      />

      {/* Assigned To */}
      <DropDownOrganism
        label="Currently Assigned To"
        placeholder="Currently Assigned To"
        onPress={() =>
          navigation.navigate('DropDownModal', {
            name: 'Currently Assigned To',
            Data: assignedToList,
            selectedData: selectedAssignedTo,
            setSelectedData: setSelectedAssignedTo,
            typeName: 'name',
            typeId: 'id',
          })
        }
        inputText={selectedAssignedTo?.name}
      />

      {/* Dates */}
      <DateInputOrganism
        label="Start Date"
        placeholder="Start Date"
        value={startDate}
        onChangeText={setStartDate}
        fieldName="date"
        dateFormat="DD-MM-YYYY"
      />

      <DateInputOrganism
        label="End Date"
        placeholder="End Date"
        value={endDate}
        onChangeText={setEndDate}
        fieldName="date"
        dateFormat="DD-MM-YYYY"
      />

      {/* Buttons */}
      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={generateReport}
          bttnText="Generate Report"
          containerStyle={styles.generateBtn}
          bttnTextStyle={{ color: colors.primary, fontSize: vw(9.8) }}
        />

        <ButtonOrganism
          onPress={applyFilter}
          bttnText="Apply Filter"
          containerStyle={styles.applyBtn}
          bttnTextStyle={{ fontSize: vw(12) }}
        />

        <ButtonOrganism
          onPress={clearFilter}
          bttnText="Clear Filter"
          containerStyle={styles.clearBtn}
          bttnTextStyle={{ color: colors.primary, fontSize: vw(12) }}
        />
      </ViewAtom>
    </View>
  );
};

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const InvoiceAndBillingWorkflow = (props: Props) => {
  const { navigation } = props;

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listVendorApi] = useVendorListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [currentStatusList, setCurrentStatusList] = useState<any>([]);
  const [assignedToList, setAssignedToList] = useState<any>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>({});
  const [selectedCurrentStatus, setSelectedCurrentStatus] = useState<any>({});
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<any>({});
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<any>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [exportUrl, setExportUrl] = useState('');

  const [summary, setSummary] = useState<any>({
    totalInvoiceAmount: 0,
    totalPaidAmount: 0,
    paidAmount: 0,
    totalUnpaidAmount: 0,
  });

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Invoice Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      listVendorDetails(1, true, '');
      getCurrentStatus();
      getAssignTo();
    }, []),
  );

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listVendorDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };
    listVendorApi(params)
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

        setSummary({
          totalInvoiceAmount: res.data.totalInvoiceAmount ?? 0,
          totalPaidAmount: res.data.totalPaidAmount ?? 0,
          totalUnpaidAmount: res.data.totalUnpaidAmount ?? 0,
        });

        const totalCount = res?.data?.totalCount ?? 0;
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      listVendorDetails(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listVendorDetails(1, true, '');
  };
  const onPressAssign = (item: any) => {
    navigation.navigate(screensName.AssignBillForm, {
      item: item,
      onDone: () => listVendorDetails(1, true, search),
    });
  };

  const onPressReAssign = (item: any) => {
    navigation.navigate(screensName.AssignBillForm, {
      updateAssigneeFlag: true,
      item: item,
      onDone: () => listVendorDetails(1, true, search),
    });
  };

  const renderListVendorDetails = useCallback(
    ({ item, index }: any) => (
      <VendorCard
        item={item}
        index={index}
        navigation={navigation}
        onPressAssign={() => {
          onPressAssign(item);
        }}
        onPressReAssign={() => {
          onPressReAssign(item);
        }}
      />
    ),
    [navigation],
  );

  const clearFilter = () => {
    setSelectedLocation({});
    setSelectedCurrentStatus({});
    setSelectedPaymentStatus({});
    setSelectedAssignedTo({});
    setStartDate('');
    setEndDate('');
    listVendorDetails(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any[] = [];

    if (selectedLocation?.id) {
      filters.push(['bipardCentreName', '=', selectedLocation.id]);
    }

    if (selectedCurrentStatus?.id) {
      filters.push(['currentStatusId', '=', selectedCurrentStatus.id]);
    }

    if (selectedPaymentStatus?.id) {
      filters.push(['isPaymentSuccess', '=', selectedPaymentStatus.id]);
    }

    if (selectedAssignedTo?.id) {
      filters.push(['currentlyAssignedToId', '=', selectedAssignedTo.id]);
    }

    if (startDate) {
      const sd = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['sentOn', '>=', sd]);
    }

    if (endDate) {
      const ed = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['sentOn', '<=', ed]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    listVendorDetails(1, true, search, filters);
  };

  const generateReport = () => {
    const filters = buildFilters();
    setInitialCall(true);
    const payload = {
      search,
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: filters.length ? filters : [],
      pageNo: 1,
      itemsPerPage: ITEMS_PER_PAGE,
      exportFlag: true,
    };
    listVendorApi(payload)
      .unwrap()
      .then((res: any) => {
        setInitialCall(false);
        setShowFilter(false);
        Toast.show({
          type: 'success',
          text2: 'Report generated successfully',
        });
        setExportUrl(res.data.exportUrl);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Report generation failed',
        });
      });
  };

  const getCurrentStatus = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_vendor_request_status',
      replacements: [['COMMON', 'ACCOUNTCONTROLLER', 'NONE'], '%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setCurrentStatusList(res.data);
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

  const getAssignTo = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_assignee_to_vendor_request',
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setAssignedToList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
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
            {showFilter ? 'Hide Filter ▲' : 'Show Filter ▼'}
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            if (exportUrl) {
              downloadAndOpenFile(exportUrl);
            } else {
              Toast.show({
                type: 'error',
                text2: 'First Click On "Generate Report" In Filter Section',
              });
            }
          }}
        >
          <ImageAtom
            source={images.download}
            style={{ tintColor: colors.black }}
          />
        </TouchableAtom>
      </View>
      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />
      <View style={styles.summaryWrapper}>
        <View style={[styles.summaryCard, { borderColor: '#28a745' }]}>
          <TextAtom style={[styles.summaryLabel, { color: '#28a745' }]}>
            Paid Amount
          </TextAtom>
          <TextAtom style={[styles.summaryValue, { color: '#28a745' }]}>
            {`₹${summary.totalPaidAmount?.toLocaleString()}`}
          </TextAtom>
        </View>

        <View style={[styles.summaryCard, { borderColor: '#dc3545' }]}>
          <TextAtom style={[styles.summaryLabel, { color: '#dc3545' }]}>
            Due Amount
          </TextAtom>
          <TextAtom style={[styles.summaryValue, { color: '#dc3545' }]}>
            {`₹${summary.totalUnpaidAmount?.toLocaleString()}`}
          </TextAtom>
        </View>
        <View style={[styles.summaryCard, { borderColor: '#007bff' }]}>
          <TextAtom style={[styles.summaryLabel, { color: '#007bff' }]}>
            Total Amount
          </TextAtom>
          <TextAtom style={[styles.summaryValue, { color: '#007bff' }]}>
            {`₹${summary.totalInvoiceAmount?.toLocaleString()}`}
          </TextAtom>
        </View>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListVendorDetails}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          showFilter ? (
            <FilterForm
              navigation={navigation}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedCurrentStatus={selectedCurrentStatus}
              setSelectedCurrentStatus={setSelectedCurrentStatus}
              selectedPaymentStatus={selectedPaymentStatus}
              setSelectedPaymentStatus={setSelectedPaymentStatus}
              selectedAssignedTo={selectedAssignedTo}
              setSelectedAssignedTo={setSelectedAssignedTo}
              currentStatusList={currentStatusList}
              assignedToList={assignedToList}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              applyFilter={applyFilter}
              clearFilter={clearFilter}
              generateReport={generateReport}
            />
          ) : null
        }
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={{ marginTop: vh(15) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listVendorDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listVendorDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export default InvoiceAndBillingWorkflow;

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
  generateBtn: {
    width: vw(105),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  applyBtn: {
    width: vw(105),
    height: vh(35),
  },
  clearBtn: {
    width: vw(105),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  summaryWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: vw(330),
    alignSelf: 'center',
  },

  summaryCard: {
    width: '32.5%',
    backgroundColor: colors.white,
    paddingVertical: vh(2.5),
    paddingHorizontal: vw(2),
    borderRadius: vw(6),
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.grey,
  },
  summaryValue: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(12),
    color: colors.black,
    marginTop: vh(1.5),
    textAlign: 'left',
  },
});
