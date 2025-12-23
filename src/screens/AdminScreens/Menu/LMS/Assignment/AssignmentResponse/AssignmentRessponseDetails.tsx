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
  ScrollView,
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
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import moment from 'moment';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useListAssignmentResponseReportMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

interface Props {
  route: any;
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

const AssignmentRessponseDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route?.params?.item;

  const [listAssignmentResponseReportApi] =
    useListAssignmentResponseReportMutation();

  const [dropDownApi] = useCommonDropdownListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const [url, setUrl] = useState('');
  const [selectedItems] = useState<any>([]);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach] = React.useState<any>({});

  const [assignmentList, setAssignmentList] = useState<any>([]);
  const [selectedassignment, setSelectedassignment] = useState<any>({});
  const [batchList, setBatchList] = useState<any>([]);
  const [selectedBacth, setSelectedBacth] = useState<any>({});
  const [selectedAssignmentStatus, setSelectedAssignmentStatus] = useState<any>(
    {},
  );
  const [startDate, setStartDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.lms.assignmentResponse.title);
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listAssignmentResponses(1, true, '');
        getAllAssignment();
        getBatchList();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listAssignmentResponses(1, true, '');
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }
    return [centerSerach.name];
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listAssignmentResponses = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      search: keyword,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [
        ...(item?.id ? [['trainingNameId', '=', item.id]] : []),
        ...filtersArray,
      ],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
      exportFlag: true,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listAssignmentResponseReportApi(params)
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

        const totalCount = res?.data?.totalCount ?? 0;
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
        setUrl(res.data.exportUrl);
        const totalCountApi = res?.data?.totalCount ?? 0;
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
      listAssignmentResponses(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listAssignmentResponses(1, true, '');
  };

  const TraineeResponseCard = ({ item, index, isSelected }: any) => {
    return (
      <TouchableAtom
        disabled={item.submissionId === 'Not Submitted'}
        onPress={() => {
          navigation.navigate(screensName.AssessmentDetails, {
            data: item,
          });
        }}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={styles.cardHeader}>
          <TextAtom style={[styles.label, styles.flex1]}>
            {strings.lms.assignmentResponse.srNo} {index + 1}
          </TextAtom>
          <View style={styles.actionRow}></View>
        </View>

        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.assignmentResponse.traineeName}
          </TextAtom>
          <TextAtom style={styles.value}>{item.traineeName || '-'}</TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.assignmentResponse.batchNo}
          </TextAtom>
          <TextAtom style={styles.value}>{item.batchName || '-'}</TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.assignmentResponse.assignmentName}
          </TextAtom>
          <TextAtom style={styles.value}>{item.assignmentName || '-'}</TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.assignmentResponse.submissionDate}
          </TextAtom>
          <TextAtom style={styles.value}>
            {moment(item.submissionDate).format('DD-MM-YYYY')}
          </TextAtom>
        </View>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>
            {strings.lms.assignmentResponse.assignmentStatus}
          </TextAtom>
          <TextAtom style={styles.value}>{item.assignmentStatus}</TextAtom>
        </View>
      </TouchableAtom>
    );
  };

  const renderItem = ({ item, index }: any) => {
    return (
      <TraineeResponseCard
        item={item}
        index={index}
        navigation={navigation}
        isSelected={selectedItems.some((x: any) => x.id === item.id)}
      />
    );
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={strings.lms.assignmentResponse.assignmentName}
        placeholder={strings.lms.assignmentResponse.assignmentName}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.assignmentResponse.assignmentName,
            Data: assignmentList,
            selectedData: selectedassignment,
            setSelectedData: (data: any) => {
              setSelectedassignment(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedassignment?.name}
      />
      <DropDownOrganism
        label={strings.lms.assignmentResponse.batch}
        placeholder={strings.lms.assignmentResponse.batch}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.assignmentResponse.batch,
            Data: batchList,
            selectedData: selectedBacth,
            setSelectedData: (data: any) => {
              setSelectedBacth(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedBacth?.name}
      />
      <DropDownOrganism
        label={strings.lms.assignmentResponse.assignmentStatus}
        placeholder={strings.lms.assignmentResponse.assignmentStatus}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.assignmentResponse.assignmentStatus,
            Data: [
              {
                id: 'Grading done',
                name: strings.lms.assignmentResponse.submitted,
              },
              {
                id: 'Not submitted',
                name: strings.lms.assignmentResponse.notSubmitted,
              },
              {
                id: 'Submitted waiting for grading',
                name: strings.lms.assignmentResponse.submittedWaiting,
              },
            ],
            selectedData: selectedAssignmentStatus,
            setSelectedData: (data: any) => {
              setSelectedAssignmentStatus(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedAssignmentStatus?.name}
      />
      <DateInputOrganism
        label={strings.lms.assignmentResponse.startDate}
        placeholder={strings.lms.assignmentResponse.startDate}
        value={startDate}
        onChangeText={(val: any) => {
          setStartDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
      />
      <DateInputOrganism
        label={strings.lms.assignmentResponse.endDate}
        placeholder={strings.lms.assignmentResponse.endDate}
        value={endDate}
        onChangeText={(val: any) => {
          setEndDate(val);
        }}
        fieldName={'date'}
        dateFormat="DD-MM-YYYY"
      />
      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={applyFilter}
          bttnText={strings.lms.assignmentResponse.applyFilter}
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={strings.lms.assignmentResponse.clearFilter}
          containerStyle={styles.clearBtn}
          bttnTextStyle={styles.clearBtnText}
        />
      </ViewAtom>
    </View>
  );

  const getAllAssignment = () => {
    setInitialCall(true);
    const params = {
      listType: 'list-all-assignment',
      bipardCentre: getCentreFilter(),
      replacements: [item.id, '%%'],
    };
    dropDownApi(params)
      .unwrap()
      .then((res: any) => {
        setAssignmentList(res.data);
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
  const getBatchList = () => {
    setInitialCall(true);
    const params = {
      listType: 'list-all-training-batch',
      bipardCentre: getCentreFilter(),
      replacements: [item.id, '%%'],
    };
    dropDownApi(params)
      .unwrap()
      .then((res: any) => {
        setBatchList(res.data);
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

  const clearFilter = () => {
    setSelectedassignment({});
    setSelectedBacth({});
    setSelectedAssignmentStatus({});
    setStartDate('');
    setEndDate('');
    listAssignmentResponses(1, true, search, []);
  };

  const applyFilter = (isExport = false) => {
    const filters = [];

    if (selectedassignment?.id) {
      filters.push(['assignmentId', '=', selectedassignment?.id]);
    }
    if (selectedBacth?.id) {
      filters.push(['batchId', '=', selectedBacth?.id]);
    }
    if (selectedAssignmentStatus?.id) {
      filters.push(['assignmentStatus', '=', selectedAssignmentStatus?.id]);
    }

    if (startDate) {
      const formatted = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['assignmentStartDate', '<=', formatted]);
    }
    if (endDate) {
      const formatted = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['assignmentEndDate', '>=', formatted]);
    }
    listAssignmentResponses(1, true, search, filters);
    setShowFilter(false);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.searchHeader}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
              <TextAtom style={styles.filterText}>
                {showFilter
                  ? strings.lms.assignmentResponse.hideFilter
                  : strings.lms.assignmentResponse.showFilter}
              </TextAtom>
            </TouchableAtom>
            <TouchableAtom
              style={styles.filterButton}
              onPress={() => {
                if (url) {
                  downloadAndOpenFile(url);
                }
              }}
            >
              <ImageAtom source={images.download} style={styles.downloadIcon} />
            </TouchableAtom>
          </View>
          <SearchBoxOrganism
            onChangeText={onChangeSearch}
            searchText={search}
            onPressCross={onClearSearch}
            searchBox={styles.marginTop10}
          />
        </ScrollView>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.assignmentResponse.noDataFound}
            </TextAtom>
          )
        }
        ListHeaderComponent={showFilter ? <FilterForm /> : null}
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={styles.marginTop10}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listAssignmentResponses(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listAssignmentResponses(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

export default AssignmentRessponseDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: vw(10),
    marginTop: vh(5),
  },
  tabButton: {
    paddingVertical: vh(8),
    paddingHorizontal: vw(20),
    backgroundColor: colors.lightGray2,
    borderRadius: vw(6),
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  activeTabText: {
    color: colors.white,
  },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  clearBtnText: {
    color: colors.primary,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.selectedCardBg,
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
    backgroundColor: colors.lightRedBg,
    borderColor: colors.darkRed,
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
  fileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vh(6),
  },

  fileInput: {
    flex: 1,
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(6),
    paddingHorizontal: vw(10),
    paddingVertical: vh(6),
    fontSize: vw(14),
    color: colors.black,
  },

  checkBtn: {
    marginLeft: vw(10),
    padding: vw(6),
    borderRadius: vw(6),
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  fileDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vh(8),
    paddingHorizontal: vw(10),
    borderWidth: vw(1),
    borderColor: colors.grey_3,
    borderRadius: vw(6),
    backgroundColor: colors.lightGrey,
    marginTop: vh(6),
  },

  fileText: {
    fontSize: vw(14),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  searchHeader: {
    height: vh(100),
  },
  filterRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  downloadIcon: {
    tintColor: colors.black,
  },
  marginTop10: {
    marginTop: vh(10),
  },
  separator: {
    height: vh(10),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },
  actionRow: {
    flexDirection: 'row',
    gap: vw(15),
  },
  flex1: {
    flex: 1,
  },
});
