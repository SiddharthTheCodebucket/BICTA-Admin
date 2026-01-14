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
import { useAppSelector } from '../../../../../../hooks';
import { useReportListFacultyMutation } from '../../../../../../injectEndpoints/reportEndpoints';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';

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
}

interface FilterArgs {
  training?: any;
  approvalStatus?: any;
  startDate?: any;
  endDate?: any;
}

const ListPermissionCard = ({
  item,
  index,
  navigation,
}: ListPermissionProps) => {
  return (
    <ViewAtom style={styles.card}>
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, styles.flex1]}>
          {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
        </TextAtom>

        <View
          style={[
            styles.statusCircle,
            item.approvalStatus === 'Approved'
              ? styles.approvedCircle
              : styles.pendingCircle,
          ]}
        >
          <TextAtom style={styles.statusIcon}>
            {item.approvalStatus === 'Approved' ? '✓' : '✕'}
          </TextAtom>
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Training Name'}</TextAtom>
          <TextAtom style={styles.value}>{item.trainingName ?? '-'}</TextAtom>
        </View>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Batch Name'}</TextAtom>
          <TextAtom style={styles.value}>{item.batchName ?? '-'}</TextAtom>
        </View>
      </View>
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Class Date'}</TextAtom>
          <TextAtom style={styles.value}>{item.classDate ?? '-'}</TextAtom>
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>{'YP Name'}</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.youngProfessionalName ?? '-'}
          </TextAtom>
        </View>
      </View>
    </ViewAtom>
  );
};

interface FilterFormProps {
  navigation: NavigationType;
  trainingList: any[];
  selectedTraining: any;
  setSelectedTraining: (d: any) => void;
  approvalStatusList: any[];
  selectedApprovalStatus: any;
  setSelectedApprovalStatus: (d: any) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  applyFilter: () => void;
  clearFilter: () => void;
  hitFilterApi: (parent?: any, module?: any, status?: any) => void;
}

const FilterForm = ({
  navigation,
  trainingList,
  selectedTraining,
  setSelectedTraining,
  approvalStatusList,
  selectedApprovalStatus,
  setSelectedApprovalStatus,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  applyFilter,
  clearFilter,
  hitFilterApi,
}: FilterFormProps) => (
  <View style={styles.filterContainer}>
    <DropDownOrganism
      label={'Training'}
      placeholder={'Training'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Training',
          Data: trainingList,
          selectedData: selectedTraining,
          setSelectedData: (data: any) => {
            setSelectedTraining(data);
            hitFilterApi({ training: data });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedTraining?.name}
    />
    <DropDownOrganism
      label={'Approval Status'}
      placeholder={'Approval Status'}
      onPress={() => {
        navigation.navigate('DropDownModal', {
          name: 'Approval Status',
          Data: approvalStatusList,
          selectedData: selectedApprovalStatus,
          setSelectedData: (data: any) => {
            setSelectedApprovalStatus(data);
            hitFilterApi({
              faculty: data,
            });
          },
          typeName: 'name',
          typeId: 'id',
        });
      }}
      inputText={selectedApprovalStatus?.name}
    />

    <DateInputOrganism
      label={'Start Date'}
      placeholder={'Start Date'}
      value={startDate}
      onChangeText={(val: any) => {
        setStartDate(val);
        hitFilterApi({ startDate: val });
      }}
      fieldName="date"
      dateFormat="DD-MM-YYYY"
    />

    <DateInputOrganism
      label={'End Date'}
      placeholder={'End Date'}
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

const CourseWiseApprovalStatus = (props: Props) => {
  const { navigation } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listReportFacultyApi] = useReportListFacultyMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [trainingList, setTrainingList] = useState<any>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>({});
  const [approvalStatusList, setApprovalStatusList] = useState<any>([]);
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<any>({});
  const [startDate, setStartDate] = useState(
    moment().subtract(1, 'day').format('DD-MM-YYYY'),
  );
  const [endDate, setEndDate] = useState(moment().format('DD-MM-YYYY'));

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Course Wise Approval Status');
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
        getTrainingList();
        getApprovalStatusList();
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
    const finalFilters =
      filtersArray.length > 0 ? filtersArray : buildFilters();
    const params: any = {
      search: keyword,
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filters: finalFilters,
      pageNo: pageNumber,
      trainingBatchClassDateWiseDataFlag: true,
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
        if (res?.data?.exportUrlPdfTrainingBatchWiseFaculty) {
          downloadAndOpenFile(res.data.exportUrlPdfTrainingBatchWiseFaculty);
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

  const renderListPermissionDetails = ({ item, index }: any) => (
    <ListPermissionCard item={item} index={index} navigation={navigation} />
  );

  const clearFilter = () => {
    setSelectedTraining({});
    setSelectedApprovalStatus({});
    setStartDate(moment().subtract(1, 'day').format('DD-MM-YYYY'));
    setEndDate(moment().format('DD-MM-YYYY'));
    listReportFaculty(1, true, search, []);
  };

  const buildFilters = () => {
    const filters: any[] = [];

    if (selectedTraining?.id) {
      filters.push(['trainingId', '=', selectedTraining.id]);
    }

    if (selectedApprovalStatus?.id) {
      filters.push(['approvalStatus', '=', selectedApprovalStatus.id]);
    }

    if (startDate) {
      filters.push([
        'date',
        '>=',
        moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    if (endDate) {
      filters.push([
        'date',
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

  const getTrainingList = () => {
    setInitialCall(true);
    const params = {
      listType: 'faculty_report_training_name',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];
        setTrainingList(resData);
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

  const getApprovalStatusList = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_approval_status_filter_for_payment_sheet',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        let resData = res.data || [];
        setApprovalStatusList(resData);
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

  const hitFilterApi = ({
    training = selectedTraining,
    approvalStatus = selectedApprovalStatus,
    startDate: sDate = startDate,
    endDate: eDate = endDate,
  }: FilterArgs = {}) => {
    const filters: any[] = [];

    if (training?.id) {
      filters.push(['trainingId', '=', [training.id]]);
    }
    if (approvalStatus?.id) {
      filters.push(['approvalStatus', '=', approvalStatus.id]);
    }

    if (sDate) {
      filters.push([
        'date',
        '>=',
        moment(sDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    if (eDate) {
      filters.push([
        'date',
        '<=',
        moment(eDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      ]);
    }

    listReportFaculty(1, true, search, filters);
  };

  const downloadPdf = () => {
    if (
      selectedTraining?.id ||
      selectedApprovalStatus?.id ||
      startDate ||
      endDate
    ) {
      Toast.show({
        type: 'info',
        text2: 'Select at least one filter to download report',
      });
      return;
    }

    const filters = buildFilters();

    listReportFaculty(1, true, search, filters, {
      exportFlagTrainingBatchWiseFaculty: true,
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
            style={{
              tintColor: colors.black,
              resizeMode: 'contain',
              width: vw(10),
              height: vw(10),
              alignSelf: 'center',
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
              trainingList={trainingList}
              selectedTraining={selectedTraining}
              setSelectedTraining={setSelectedTraining}
              approvalStatusList={approvalStatusList}
              selectedApprovalStatus={selectedApprovalStatus}
              setSelectedApprovalStatus={setSelectedApprovalStatus}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
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

export default CourseWiseApprovalStatus;

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
  statusCircle: {
    width: vw(18),
    height: vw(18),
    borderRadius: vw(9),
    alignItems: 'center',
    justifyContent: 'center',
  },

  approvedCircle: {
    backgroundColor: colors.green,
  },

  pendingCircle: {
    backgroundColor: colors.red_2,
  },

  statusIcon: {
    color: colors.white,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(10),
  },
});
