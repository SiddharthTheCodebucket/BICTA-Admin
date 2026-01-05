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
  ScrollView,
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
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useListExaminationSubmissionReportMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

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

const DescriptionRow = ({ label, value }: any) => (
  <View style={styles.flex1}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value}>{value}</TextAtom>
  </View>
);

const TraineeResponseList = (props: Props) => {
  const { navigation } = props;
  const item = props.route?.params?.data;

  const [listTraineeResponsesApi] =
    useListExaminationSubmissionReportMutation();

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

  const [batchList, setBatchList] = useState<any>([]);
  const [selectedBacth, setSelectedBacth] = useState<any>({});
  const [selectedResult, setSelectedResult] = useState<any>({});

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.traineeResponseList.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTraineeResponses(1, true, '');
        getBatchList();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTraineeResponses(1, true, '');
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

  const listTraineeResponses = (
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
      filters: [
        ...(item?.id ? [['testId', '=', item.testId]] : []),
        ...filtersArray,
      ],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
      exportFlag: true,
      ...extraParams,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listTraineeResponsesApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.user ?? [];
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
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const handleSearch = useCallback(
    debounce((text: string) => {
      listTraineeResponses(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTraineeResponses(1, true, '');
  };

  const TraineeCard = ({ item, index, isSelected }: any) => {
    return (
      <TouchableAtom
        onPress={() => {
          navigation.navigate(screensName.ExamResponseDetailsListTrainee, {
            data: item,
          });
        }}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={styles.cardHeader}>
          <TextAtom style={styles.flex1Label}>
            {strings.lms.examination.traineeResponseList.srNo} {index + 1}
          </TextAtom>

          <TouchableAtom
            onPress={() =>
              navigation.navigate(screensName.ExamResponseSheet, {
                item: item,
              })
            }
            style={styles.responseBtn}
          >
            <TextAtom style={styles.responseBtnText}>
              {strings.lms.examination.traineeResponseList.viewResponse}
            </TextAtom>
          </TouchableAtom>
        </View>

        <DescriptionRow
          label={strings.lms.examination.traineeResponseList.trainingName}
          value={item.trainingName || '-'}
        />

        <DescriptionRow
          label={strings.lms.examination.traineeResponseList.traineeName}
          value={`${item.traineeName || '-'} (${item.traineeId})`}
        />

        <DescriptionRow
          label={strings.lms.examination.traineeResponseList.batchNo}
          value={item.batchName || '-'}
        />

        <DescriptionRow
          label={strings.lms.examination.traineeResponseList.examName}
          value={item.testName || '-'}
        />
      </TouchableAtom>
    );
  };

  const renderTraineeResponseItem = ({ item, index }: any) => {
    return (
      <TraineeCard
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
        label={strings.lms.examination.traineeResponseList.batch}
        placeholder={strings.lms.examination.traineeResponseList.batch}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.examination.traineeResponseList.batch,
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
        label={strings.lms.examination.traineeResponseList.result}
        placeholder={strings.lms.examination.traineeResponseList.result}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: strings.lms.examination.traineeResponseList.result,
            Data: [
              {
                id: strings.lms.examination.traineeResponseList.fail,
                name: strings.lms.examination.traineeResponseList.fail,
              },
              {
                id: strings.lms.examination.traineeResponseList.pass,
                name: strings.lms.examination.traineeResponseList.pass,
              },
            ],
            selectedData: selectedResult,
            setSelectedData: (data: any) => {
              setSelectedResult(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedResult?.name}
      />

      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={applyFilter}
          bttnText={strings.lms.examination.traineeResponseList.applyFilter}
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={strings.lms.examination.traineeResponseList.clearFilter}
          containerStyle={styles.clearBtn}
          bttnTextStyle={styles.primaryText}
        />
      </ViewAtom>
    </View>
  );

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
    setSelectedBacth({});
    setSelectedResult({});
    listTraineeResponses(1, true, search, []);
  };

  const applyFilter = (isExport = false) => {
    const filters: any = [];

    const extraParams: any = {};

    // Pass Result directly in params
    if (selectedResult?.id) {
      extraParams.resultStatus = selectedResult.id;
    }

    // Pass Batch inside filters array
    if (selectedBacth?.id) {
      filters.push(['batchId', '=', selectedBacth.id]);
    }

    listTraineeResponses(1, true, search, filters, extraParams);
    setShowFilter(false);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.headerWrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.rowWrapper}>
            <TouchableAtom style={styles.filterButton} onPress={toggleFilter}>
              <TextAtom style={styles.filterText}>
                {showFilter
                  ? strings.lms.examination.traineeResponseList.hideFilter
                  : strings.lms.examination.traineeResponseList.showFilter}
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
            searchBox={styles.searchBoxMargin}
          />
        </ScrollView>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTraineeResponseItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.examination.traineeResponseList.noDataFound}
            </TextAtom>
          )
        }
        ListHeaderComponent={showFilter ? <FilterForm /> : null}
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={styles.paginationLoader}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listTraineeResponses(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTraineeResponses(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default TraineeResponseList;

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
  responseBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vh(4),
    paddingHorizontal: vw(10),
    borderRadius: vw(4),
  },

  responseBtnText: {
    color: colors.white,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(10),
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
    backgroundColor: colors.lightGray2,
    marginTop: vh(6),
  },

  fileText: {
    fontSize: vw(14),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(10),
  },
  flex1Label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },
  actionRow: { flexDirection: 'row', gap: vw(15) },
  flex1: { flex: 1 },
  headerWrapper: { height: vh(100) },
  rowWrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
  searchBoxMargin: { marginTop: vh(10) },
  paginationLoader: { marginTop: vh(10) },
  itemSeparator: { height: vh(10) },
  primaryText: { color: colors.primary },
});
