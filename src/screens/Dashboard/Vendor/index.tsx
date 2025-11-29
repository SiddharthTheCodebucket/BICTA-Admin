import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, images, vh, vw } from '../../../constants';
import { NavigationType } from '../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../components/atoms/TouchableAtom';

import {
  useVendorDashboardMutation,
  useVendorListMutation,
} from '../../../injectEndpoints/dashboardEndpoints';
import ImageAtom from '../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../utils/CommonFunction';

interface Props {
  route: any;
  navigation: NavigationType;
}

const FILTER_TABS = ['All', 'Gaya', 'Patna'];

const debounce = (func: any, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const InvoiceDashboard = (props: Props) => {
  const { navigation } = props;

  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [invoiceApi] = useVendorDashboardMutation();
  const [vendorList] = useVendorListMutation();

  const [activeTab, setActiveTab] = useState('All');
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [exportUrlExcel, setExportUrlExcel] = useState('');
  const [exportUrlPdf, setExportUrlPdf] = useState('');
  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = useState('');

  const [summary, setSummary] = useState<any>({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
  });

  const getCentreFilter = () => {
    if (activeTab === 'All') return ['Gaya', 'Patna'];
    return [activeTab];
  };
  const getVendorCentreFilter = () => {
    if (activeTab === 'All') return '';
    return activeTab;
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad) {
        setFirstTimeLoad(false);
        fetchDashboard(1, true, '');
      }
    }, [firstTimeLoad]),
  );

  useEffect(() => {
    fetchDashboard(1, true, search);
    fetchVendorData(1, true, '');
  }, [activeTab]);

  const fetchDashboard = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);
    const params: any = {
      trainingCentre: 'all',
      search: keyword,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: getCentreFilter(),
      exportFlag: true,
    };
    invoiceApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data.data ?? [];

        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        if (pageNumber !== 1) {
          setData((prev: any) => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setExportUrlExcel(res.data?.exportUrlExcel);
        setExportUrlPdf(res.data?.exportUrlPdf);

        const totalCount = res?.totalCount ?? 0;
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
        setPage(pageNumber);
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const fetchVendorData = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centre = getVendorCentreFilter();
    const params: any = {
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: centre ? [['bipardCentreId', '=', centre]] : [],
      pageNo: 1,
      itemsPerPage: 10,
    };

    vendorList(params)
      .unwrap()
      .then((res: any) => {
        const list = res.data.data ?? [];

        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        setSummary({
          totalInvoices: res.data.totalCount ?? 0,
          totalAmount: res.data.totalInvoiceAmount ?? 0,
          paidAmount: res.data.totalPaidAmount ?? 0,
          unpaidAmount: res.data.totalUnpaidAmount ?? 0,
        });
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      fetchDashboard(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    fetchDashboard(1, true, '');
  };
  const OfficerCard = ({ item, index }: any) => {
    return (
      <View style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: vh(8) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Name</TextAtom>
            <TextAtom numberOfLines={0} style={styles.value}>
              {item.officerName ?? '-'}
            </TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Bipard Campus</TextAtom>
            <TextAtom style={styles.centerTag}>{item.bipardCentre}</TextAtom>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Total Invoices</TextAtom>
            <TextAtom style={styles.value}>{item.totalInvoices}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Pending Bills</TextAtom>
            <TextAtom style={styles.valueRight}>{item.total}</TextAtom>
          </View>
        </View>

        {/* Row 3 */}
        <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>0 – 3 Days</TextAtom>
            <TextAtom style={styles.value}>{item['0To3Days']}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>4 – 7 Days</TextAtom>
            <TextAtom style={styles.valueRight}>{item['4To7Days']}</TextAtom>
          </View>
        </View>

        {/* Row 4 */}
        <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>8 – 15 Days</TextAtom>
            <TextAtom style={styles.value}>{item['8To15Days']}</TextAtom>
          </View>

          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>More than 15 Days</TextAtom>
            <TextAtom style={styles.valueRight}>{item.moreThan15Days}</TextAtom>
          </View>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }: any) => (
    <OfficerCard item={item} index={index} />
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View style={styles.tabContainer}>
        {FILTER_TABS.map(tab => (
          <TouchableAtom
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBox, activeTab === tab && styles.activeTabBox]}
          >
            <TextAtom
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </TextAtom>
          </TouchableAtom>
        ))}
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            if (!isNullUndefined(exportUrlExcel)) {
              downloadAndOpenFile(exportUrlExcel);
            }
          }}
        >
          <ImageAtom
            source={images.download}
            style={{
              tintColor: colors.black,
              resizeMode: 'contain',
              width: vw(10),
              height: vw(10),
            }}
          />
          <TextAtom
            style={{
              color: colors.black,
              fontFamily: fonts.Roboto_Regular,
              fontSize: vw(8),
            }}
          >
            Excel
          </TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.filterButton}
          onPress={() => {
            if (!isNullUndefined(exportUrlPdf)) {
              downloadAndOpenFile(exportUrlPdf);
            }
          }}
        >
          <ImageAtom
            source={images.download}
            style={{
              tintColor: colors.black,
              resizeMode: 'contain',
              width: vw(10),
              height: vw(10),
            }}
          />
          <TextAtom
            style={{
              color: colors.black,
              fontFamily: fonts.Roboto_Regular,
              fontSize: vw(8),
            }}
          >
            Pdf
          </TextAtom>
        </TouchableAtom>
      </View>
      <View style={styles.summaryWrapper}>
        <View style={[styles.summaryCard, { borderColor: '#6C7A89' }]}>
          <TextAtom style={styles.summaryLabel}>Total Invoices</TextAtom>
          <TextAtom style={styles.summaryValue}>
            {summary.totalInvoices}
          </TextAtom>
        </View>

        <View style={[styles.summaryCard, { borderColor: '#007bff' }]}>
          <TextAtom style={styles.summaryLabel}>Total Amount (INR)</TextAtom>
          <TextAtom style={styles.summaryValue}>
            {summary.totalAmount?.toLocaleString()}
          </TextAtom>
        </View>

        <View style={[styles.summaryCard, { borderColor: '#28a745' }]}>
          <TextAtom style={styles.summaryLabel}>Paid Amount (INR)</TextAtom>
          <TextAtom style={styles.summaryValue}>
            {summary.paidAmount?.toLocaleString()}
          </TextAtom>
        </View>

        <View style={[styles.summaryCard, { borderColor: '#dc3545' }]}>
          <TextAtom style={styles.summaryLabel}>Unpaid Amount (INR)</TextAtom>
          <TextAtom style={styles.summaryValue}>
            {summary.unpaidAmount?.toLocaleString()}
          </TextAtom>
        </View>
      </View>

      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(5) }}
      />

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(it, idx) => idx.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          ) : null
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
              fetchDashboard(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? fetchDashboard(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default InvoiceDashboard;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  tabContainer: {
    flexDirection: 'row',
    gap: vw(10),
    marginBottom: vh(8),
  },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  tabBox: {
    paddingVertical: vh(4),
    paddingHorizontal: vw(12),
    backgroundColor: '#EAEAEA',
    borderRadius: vw(6),
  },
  activeTabBox: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Medium,
  },
  activeTabText: { color: colors.white },

  card: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(12),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  cardTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.black,
  },

  centerTag: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(13),
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  divider: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginVertical: vh(8),
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(13),
  },

  value: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(13),
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(40),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },

  summaryWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(4),
    flexWrap: 'wrap',
  },

  summaryCard: {
    width: '48%',
    backgroundColor: colors.white,
    height: 'auto',
    paddingVertical: vh(3),
    paddingHorizontal: vw(4),
    borderRadius: vw(6),
    borderWidth: 2,
    marginBottom: vh(8),
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
    fontSize: vw(14),
    color: colors.black,
    marginTop: vh(2),
  },
  labelRight: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    fontSize: vw(13),
    textAlign: 'right',
  },

  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    fontSize: vw(13),
    textAlign: 'right',
  },

  filterButton: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    alignSelf: 'flex-end',
    paddingVertical: vh(4),
    width: vw(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
