import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, images, vh, vw } from '../../../../constants';
import strings from '../../../../constants/strings';
import { NavigationType } from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import {
  useVendorDashboardMutation,
  useVendorListMutation,
} from '../../../../injectEndpoints/dashboardEndpoints';
import ImageAtom from '../../../../components/atoms/ImageAtom';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../utils/CommonFunction';

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
          text2: err?.data?.message || strings.something_went_wrong,
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
          text2: err?.data?.message || strings.something_went_wrong,
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
          <TextAtom style={[styles.label, styles.flex1]}>
            {strings.vendor.srNo} {index + 1}
          </TextAtom>
        </View>

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>{strings.vendor.name}</TextAtom>
            <TextAtom numberOfLines={0} style={styles.value}>
              {item.officerName ?? '-'}
            </TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={styles.labelRight}>
              {strings.vendor.bipardCampus}
            </TextAtom>
            <TextAtom style={styles.centerTag}>{item.bipardCentre}</TextAtom>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.vendor.totalInvoices}
            </TextAtom>
            <TextAtom style={styles.value}>{item.totalInvoices}</TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={styles.labelRight}>
              {strings.vendor.pendingBills}
            </TextAtom>
            <TextAtom style={styles.valueRight}>{item.total}</TextAtom>
          </View>
        </View>

        {/* Row 3 */}
        <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.vendor.zeroToThreeDays}
            </TextAtom>
            <TextAtom style={styles.value}>{item['0To3Days']}</TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={styles.labelRight}>
              {strings.vendor.fourToSevenDays}
            </TextAtom>
            <TextAtom style={styles.valueRight}>{item['4To7Days']}</TextAtom>
          </View>
        </View>

        <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
          <View style={styles.flex1}>
            <TextAtom style={styles.label}>
              {strings.vendor.eightToFifteenDays}
            </TextAtom>
            <TextAtom style={styles.value}>{item['8To15Days']}</TextAtom>
          </View>

          <View style={[styles.flex1, styles.alignEnd]}>
            <TextAtom style={styles.labelRight}>
              {strings.vendor.moreThanFifteenDays}
            </TextAtom>
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
    <View style={styles.container}>
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
            style={styles.downloadIconStyle}
          />
          <TextAtom style={styles.downloadText}>
            {strings.vendor.excel}
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
            style={styles.downloadIconStyle}
          />
          <TextAtom style={styles.downloadText}>{strings.vendor.pdf}</TextAtom>
        </TouchableAtom>
      </View>
      <View style={styles.summaryWrapper}>
        <View style={[styles.summaryCard, styles.borderGray]}>
          <TextAtom style={styles.summaryLabel}>
            {strings.vendor.totalInvoices}
          </TextAtom>
          <TextAtom style={styles.summaryValue}>
            {summary.totalInvoices}
          </TextAtom>
        </View>

        <View style={[styles.summaryCard, styles.borderBlue]}>
          <TextAtom style={styles.summaryLabel}>
            {strings.vendor.totalAmount}
          </TextAtom>
          <TextAtom style={styles.summaryValue}>
            {summary.totalAmount?.toLocaleString()}
          </TextAtom>
        </View>

        <View style={[styles.summaryCard, styles.borderGreen]}>
          <TextAtom style={styles.summaryLabel}>
            {strings.vendor.paidAmount}
          </TextAtom>
          <TextAtom style={styles.summaryValue}>
            {summary.paidAmount?.toLocaleString()}
          </TextAtom>
        </View>

        <View style={[styles.summaryCard, styles.borderRed]}>
          <TextAtom style={styles.summaryLabel}>
            {strings.vendor.unpaidAmount}
          </TextAtom>
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
            <TextAtom style={styles.emptyText}>
              {strings.vendor.noDataFound}
            </TextAtom>
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
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </View>
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
    paddingHorizontal: vw(13),
    backgroundColor: colors.lightGray2,
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
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    width: vw(325),
    marginLeft: vh(2),
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
    shadowColor: colors.black,
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
    width: vw(55),
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  downloadIconStyle: {
    tintColor: colors.black,
    resizeMode: 'contain',
    width: vw(10),
    height: vw(10),
  },
  downloadText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(8),
  },
  borderGray: {
    borderColor: colors.slateGray,
  },
  borderBlue: {
    borderColor: colors.infoBlue,
  },
  borderGreen: {
    borderColor: colors.successGreen2,
  },
  borderRed: {
    borderColor: colors.dangerRed,
  },
  itemSeparator: {
    height: vh(10),
  },
});
