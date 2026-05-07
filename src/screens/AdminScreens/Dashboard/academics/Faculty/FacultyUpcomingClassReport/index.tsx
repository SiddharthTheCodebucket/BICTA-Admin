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
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import FormSearch from '../../../../../../components/templates/FormSearch';
import FormDropdownFieldWithTitle from '../../../../../../components/templates/FormDropdownFieldWithTitle';
import FormDatePickerWithTitle from '../../../../../../components/templates/FormDatePickerWithTitle';
import FormWhiteButton from '../../../../../../components/templates/FormWhiteButton';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useAppSelector } from '../../../../../../hooks';
import { useReportListFacultyFutureClassCountMutation } from '../../../../../../injectEndpoints/reportEndpoints';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import AdminListHeader from '../../../../../../components/organisms/AdminListHeader';

interface Props {
  navigation: NavigationType;
  embeddedInFacultyTabs?: boolean;
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
}

interface FilterArgs {
  startDate?: any;
  endDate?: any;
  facultyType?: any;
}

const ListPermissionCard = ({
  item,
  index,
  navigation,
}: ListPermissionProps) => {
  return (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.FacultyUpcomingClassTimeTable, {
          item: item,
        });
      }}
    >
      <TextAtom style={styles.cardTitle}>
        {item.facultyName ?? 'Faculty Name'}
      </TextAtom>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Faculty Unique Id'}</TextAtom>
          <TextAtom style={styles.value}>
            {item.facultyUniqueId ?? '-'}
          </TextAtom>
        </View>
        <View style={{ flex: 1, alignSelf: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Class Date'}</TextAtom>
          <TextAtom style={styles.valueRight}>
            {moment(item.classDate).format('DD-MM-YYYY') ?? '-'}
          </TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Faculty Type'}</TextAtom>
          <TextAtom style={styles.value}>{item.facultyType ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1, alignSelf: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'Class Count'}</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.classCount ? `${item.classCount}` : '-'}
          </TextAtom>
        </View>
      </View>
    </TouchableAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  facultyTypeList: any[];
  selectedFacultyType: any;
  setSelectedFacultyType: (d: any) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  facultyTypeList,
  selectedFacultyType,
  setSelectedFacultyType,
  applyFilter,
  clearFilter,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <FormDatePickerWithTitle
      title="Start Date"
      value={startDate ? new Date(startDate) : new Date()}
      onChange={date => {
        const dateStr = moment(date).format('DD-MM-YYYY');
        setStartDate(dateStr);
        hitFilterApi({ startDate: dateStr });
      }}
      placeholder="Start Date"
    />

    <FormDatePickerWithTitle
      title="End Date"
      value={endDate ? new Date(endDate) : new Date()}
      onChange={date => {
        const dateStr = moment(date).format('DD-MM-YYYY');
        setEndDate(dateStr);
        hitFilterApi({ endDate: dateStr });
      }}
      placeholder="End Date"
    />

    <FormDropdownFieldWithTitle
      title="Faculty Type"
      data={facultyTypeList}
      value={selectedFacultyType}
      onChange={data => {
        setSelectedFacultyType(data);
        hitFilterApi({ facultyType: data });
      }}
      labelField="name"
      valueField="id"
      placeholder="Faculty Type"
    />

    <View style={styles.buttonRow}>
      <FormWhiteButton
        onPress={clearFilter}
        title={strings.hostelManagement.bedAvailability.clearFilter}
        containerStyle={{ flex: 1, marginRight: vw(8) }}
      />
      <FormGradientButton
        onPress={applyFilter}
        title={strings.hostelManagement.bedAvailability.applyFilter}
        containerStyle={{ flex: 1 }}
      />
    </View>
  </View>
);

const BedItemSeparator = () => <View style={styles.itemSeparator} />;

let facultyTypeList = [
  { id: 'Guest faculty', name: 'Guest faculty' },
  { id: 'In-house faculty', name: 'In-house faculty' },
];

const FacultyUpcomingClassReport = (props: Props) => {
  const { navigation, embeddedInFacultyTabs } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listReportFacultyApi] = useReportListFacultyFutureClassCountMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);

  const [selectedFacultyType, setSelectedFacultyType] = useState<any>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    if (embeddedInFacultyTabs) {
      return;
    }
    Header.setNavigation(navigation, 'Faculty Upcoming Class List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const toggleSearchShow = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSearch(!showSearch);
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);

        listReportFaculty(1, true, search, []);
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listReportFaculty(1, true, '');
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
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
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

        setPage(pageNumber);

        if (res?.data?.exportUrlExcel) {
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

  const renderListPermissionDetails = ({ item, index }: any) => (
    <ListPermissionCard item={item} index={index} navigation={navigation} />
  );

  const clearFilter = () => {
    setSelectedFacultyType({});
    setStartDate('');
    setEndDate('');
    listReportFaculty(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any[] = [];

    if (selectedFacultyType?.id) {
      filters.push(['facultyType', '=', selectedFacultyType.id]);
    }

    if (startDate) {
      filters.push([
        'classDate',
        '>=',
        moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    if (endDate) {
      filters.push([
        'classDate',
        '<=',
        moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    return filters;
  };

  const applyFilter = () => {
    const filters = buildFilters();
    listReportFaculty(1, true, search, filters);
    setShowFilter(false);
  };

  const hitFilterApi = ({
    startDate: sDate = startDate,
    endDate: eDate = endDate,
    facultyType = selectedFacultyType,
  }: FilterArgs = {}) => {
    const filters: any[] = [];

    if (facultyType?.id) {
      filters.push(['facultyType', '=', facultyType.id]);
    }

    if (sDate) {
      filters.push([
        'classDate',
        '>=',
        moment(sDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    if (eDate) {
      filters.push([
        'classDate',
        '<=',
        moment(eDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    listReportFaculty(1, true, search, filters);
  };

  const downloadExcel = () => {
    const filters = buildFilters();

    listReportFaculty(1, true, search, filters, {
      exportFlagExcel: true,
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader
          config={{
            title: 'Upcoming Class Report',
            count: data.length,
            showCount: true,
            search: {
              visible: true,
              onPress: toggleSearchShow,
            },
            filter: {
              visible: true,
              onPress: () => setShowFilter(true),
            },
          }}
        />
        {/* <TouchableAtom
            style={styles.excelButton}
            onPress={() => {
              downloadExcel();
            }}
          >
            <ImageAtom source={images.download} style={styles.excelIcon} />
            <TextAtom style={styles.excelText}>Excel</TextAtom>
          </TouchableAtom> */}

        {showSearch && (
          <FormSearch
            value={search}
            onChangeText={onChangeSearch}
            onClear={onClearSearch}
          />
        )}
      </View>

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
        ListHeaderComponent={<View />}
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

      <AdminBottomModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filters"
      >
        <FilterForm
          navigation={navigation}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
          facultyTypeList={facultyTypeList}
          selectedFacultyType={selectedFacultyType}
          setSelectedFacultyType={setSelectedFacultyType}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          hitFilterApi={hitFilterApi}
        />
      </AdminBottomModal>
    </SafeAreaView>
  );
};

export default FacultyUpcomingClassReport;

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
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
  },
  labelRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
    textAlign: 'right',
  },
  value: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(5),
  },
  valueRight: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(5),
    textAlign: 'right',
  },
  cardTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.black,
    marginBottom: vh(10),
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
  excelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginLeft: vw(10),
  },
  excelIcon: {
    tintColor: colors.black,
    resizeMode: 'contain',
    width: vw(10),
    height: vw(10),
    marginRight: vw(5),
  },
  excelText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: vw(15),
  },

  summaryCard: {
    flex: 1,
    borderRadius: vw(6),
    paddingVertical: vh(3),
    paddingHorizontal: vw(10),
    marginHorizontal: vw(5),
  },

  amountCard: {
    backgroundColor: '#4A90FF',
  },

  countCard: {
    backgroundColor: '#9EA3AE',
  },

  summaryLabel: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
  },

  summaryValue: {
    color: colors.white,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(10),
    marginTop: vh(2),
  },
});
