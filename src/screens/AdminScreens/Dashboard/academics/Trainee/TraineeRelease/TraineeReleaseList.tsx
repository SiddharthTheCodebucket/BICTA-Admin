/* eslint-disable eslint-comments/no-unused-disable, no-unreachable, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  colors,
  fonts,
  screensName,
  SvgEditPencile,
  SvgSignin,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import AdminListHeader from '../../../../../../components/organisms/AdminListHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import SubTab from '../../../../../../components/molecules/SubTab';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import {
  useListTraineeDetailsMutation,
  useListTrainingBatchDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useGetCentre } from '../../../../../../hooks/useGetCentre';

interface Props {
  navigation: NavigationType;
}

const ITEMS_PER_PAGE = 10;

const debounce = (func: any, delay: number) => {
  let timer: any;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const TraineeReleaseList = ({ navigation }: Props) => {
  const center = useGetCentre();

  const [commonListApi] = useCommonDropdownListMutation();
  const [listTrainingBatchDetailsApi] = useListTrainingBatchDetailsMutation();
  const [listTraineeDetailsApi] = useListTraineeDetailsMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentAppliedFilters, setCurrentAppliedFilters] = useState<any[]>([]);

  const [trainingList, setTrainingList] = useState<any[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>({});
  const [batchList, setBatchList] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>({});
  const [selectedTraineeReleased, setSelectedTraineeReleased] = useState<any>(
    {},
  );
  const [selectedIndeminityBond, setSelectedIndeminityBond] = useState<any>({});

  const [search, setSearch] = useState('');
  const [centerSerach] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'current' | 'complete'>('current');

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Trainee Management',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }
    return [centerSerach.name];
  };

  const listTrainingDetais = useCallback(
    (
      pageNumber: number,
      initial: boolean,
      keyword: string,
      filtersArray: any[] = currentAppliedFilters,
    ) => {
      initial ? setInitialCall(true) : setInitialCall(false);

      const centreFilter = getCentreFilter();
      const params: any = {
        search: keyword,
        sort: {
          attributes: ['created_at'],
          sorts: ['desc'],
        },
        filters: filtersArray,
        pageNo: pageNumber,
        itemsPerPage: ITEMS_PER_PAGE,
        bipardCentre: centreFilter ?? [],
        isCourseActive: activeTab === 'current',
      };

      listTraineeDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          const newData = res?.data?.data ?? [];
          const count = res?.data?.totalCount ?? 0;

          setData(prev => (pageNumber === 1 ? newData : [...prev, ...newData]));
          setTotalCount(count);
          setPage(pageNumber);
          setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < count);
          setInitialCall(false);
          setPagination(false);
          setRefreshing(false);
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
    },
    [activeTab, currentAppliedFilters, listTraineeDetailsApi],
  );

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad) {
        setFirstTimeLoad(false);
        getTrainingList();
        listTrainingDetais(1, true, '');
      }
    }, [firstTimeLoad, listTrainingDetais]),
  );

  useEffect(() => {
    if (firstTimeLoad) return;
    listTrainingDetais(1, true, search);
  }, [activeTab]);

  const handleSearch = useCallback(
    debounce((text: string) => {
      listTrainingDetais(1, true, text);
    }, 500),
    [listTrainingDetais],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTrainingDetais(1, true, '');
  };

  const getTrainingList = () => {
    setInitialCall(true);
    commonListApi({
      listType: 'list-all-training',
      bipardCentre: center,
      replacements: ['%%'],
    })
      .unwrap()
      .then((res: any) => {
        setTrainingList(res?.data ?? []);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const listTrainingBatchDetails = (id: any) => {
    setInitialCall(true);
    listTrainingBatchDetailsApi({
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['asc'],
      },
      filters: ['trainingNameId', '=', id],
      pageNo: 1,
      itemsPerPage: null,
      bipardCentre: [],
    })
      .unwrap()
      .then((res: any) => {
        setBatchList(res?.data?.data ?? []);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const clearFilter = () => {
    setSelectedTraining({});
    setSelectedBatch({});
    setSelectedTraineeReleased({});
    setSelectedIndeminityBond({});
    setCurrentAppliedFilters([]);
    listTrainingDetais(1, true, search, []);
  };

  const applyFilter = () => {
    const filters: any[] = [];

    if (selectedTraining?.id) {
      filters.push(['nameOfTrainingProgrammeId', '=', selectedTraining.id]);
    }
    if (selectedBatch?.id) {
      filters.push(['batchNoId', '=', selectedBatch.id]);
    }
    if (selectedTraineeReleased?.id) {
      filters.push(['isReleased', '=', selectedTraineeReleased.id]);
    }
    if (selectedIndeminityBond?.id) {
      filters.push([
        'isTraineeIndemnityBondSubmitted',
        '=',
        selectedIndeminityBond.id,
      ]);
    }

    setCurrentAppliedFilters(filters);
    listTrainingDetais(1, true, search, filters);
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(prev => !prev);
  };

  const toggleSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSearch(prev => !prev);
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={'Training'}
        placeholder={'Training'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Training',
            Data: trainingList,
            selectedData: selectedTraining,
            setSelectedData: (item: any) => {
              setSelectedTraining(item);
              setSelectedBatch({});
              listTrainingBatchDetails(item.id);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedTraining?.name}
      />

      <DropDownOrganism
        label={'Batch'}
        placeholder={'Batch'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Batch',
            Data: batchList,
            selectedData: selectedBatch,
            setSelectedData: (item: any) => {
              setSelectedBatch(item);
            },
            typeName: 'batchName',
            typeId: 'id',
          });
        }}
        inputText={selectedBatch?.batchName}
      />

      <DropDownOrganism
        label={'Indeminity Bond'}
        placeholder={'Indeminity Bond'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Indeminity Bond',
            Data: [
              { id: 'Yes', name: 'Yes' },
              { id: 'No', name: 'No' },
            ],
            selectedData: selectedIndeminityBond,
            setSelectedData: (item: any) => {
              setSelectedIndeminityBond(item);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedIndeminityBond?.name}
      />

      <DropDownOrganism
        label={'Trainee Released'}
        placeholder={'Trainee Released'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Trainee Released',
            Data: [
              { id: 'Yes', name: 'Yes' },
              { id: 'No', name: 'No' },
            ],
            selectedData: selectedTraineeReleased,
            setSelectedData: (item: any) => {
              setSelectedTraineeReleased(item);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedTraineeReleased?.name}
      />

      <ViewAtom style={styles.buttonRow}>
        <ButtonOrganism
          onPress={applyFilter}
          bttnText="Apply Filter"
          containerStyle={styles.applyBtn}
        />
        <ButtonOrganism
          onPress={clearFilter}
          bttnText="Clear Filter"
          containerStyle={styles.clearBtn}
          bttnTextStyle={{ color: colors.primary }}
        />
      </ViewAtom>
    </View>
  );

  const renderListRoomDetails = ({ item }: any) => {
    const isReleased = item?.isReleased === 'Yes';

    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.TraineeReleaseDetails, {
            data: item,
          });
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.initialCircle}>
              <TextAtom style={styles.initialText}>
                {item?.name?.[0] || 'T'}
              </TextAtom>
            </View>

            <View style={styles.headerTextBlock}>
              <TextAtom numberOfLines={1} style={styles.cardName}>
                {item?.name || '-'}
              </TextAtom>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableAtom
              style={{ marginRight: 4 }}
              onPress={() => {
                navigation.navigate(screensName.TraineeReleaseDetails, {
                  data: item,
                });
              }}
            >
              <SvgEditPencile />
            </TouchableAtom>

            <TouchableAtom
              style={{ marginLeft: 4 }}
              onPress={() => {
                if (isReleased) {
                  navigation.navigate(screensName.TraineeReleaseDetails, {
                    data: item,
                  });
                  return;
                }

                navigation.navigate(screensName.TraineeReleaseForm, {
                  item,
                  onDone: () =>
                    listTrainingDetais(1, true, search, currentAppliedFilters),
                });
              }}
            >
              <SvgSignin />
            </TouchableAtom>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.topInfoItem}>
            <TextAtom style={styles.statLabel}>Training ID</TextAtom>
            <TextAtom style={styles.statValue}>
              {item?.traineeId || '-'}
            </TextAtom>
          </View>
          <View style={styles.topInfoItem}>
            <TextAtom style={styles.statLabel}>Batch No</TextAtom>
            <TextAtom style={styles.statValue}>
              {item?.batchName || '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.programBlock}>
          <TextAtom style={styles.metaLabel}>Training Programme</TextAtom>
          <TextAtom numberOfLines={2} style={styles.programText}>
            {item?.nameOfTrainingProgramme || '-'}
          </TextAtom>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <TextAtom style={styles.metaLabel}>Father Name</TextAtom>
            <TextAtom style={styles.metaValue}>
              {item?.fatherName || '-'}
            </TextAtom>
          </View>
          <View style={styles.gridItem}>
            <TextAtom style={styles.metaLabel}>Mother Name</TextAtom>
            <TextAtom style={styles.metaValue}>
              {item?.motherName || '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridItem}>
            <TextAtom style={styles.metaLabel}>Designation</TextAtom>
            <TextAtom style={styles.metaValue}>
              {item?.designation || '-'}
            </TextAtom>
          </View>
          <View style={styles.gridItem}>
            <TextAtom style={styles.metaLabel}>Mobile No.</TextAtom>
            <TextAtom style={styles.metaValue}>
              {item?.mobileNo || '-'}
            </TextAtom>
          </View>
        </View>

        <TouchableAtom
          onPress={() => {
            navigation.navigate(screensName.TraineeReleaseDetails, {
              data: item,
            });
          }}
        >
          <TextAtom style={styles.viewMoreText}>View More</TextAtom>
        </TouchableAtom>
      </TouchableAtom>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.headerWrap}>
        <AdminListHeader
          config={{
            title: 'Trainee Release',
            count: totalCount,
            showCount: true,
            search: {
              visible: true,
              onPress: toggleSearch,
            },
            filter: {
              visible: true,
              onPress: toggleFilter,
            },
          }}
        />
      </View>

      {showSearch && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={styles.searchBox}
        />
      )}

      <SubTab
        tabs={[
          { label: 'Current Course', value: 'current' },
          { label: 'Complete Course', value: 'complete' },
        ]}
        activeTab={activeTab}
        onTabChange={value => setActiveTab(value as 'current' | 'complete')}
        style={{ marginTop: vh(10) }}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListRoomDetails}
        keyExtractor={(item, index) =>
          item?.traineeId ? String(item.traineeId) : index.toString()
        }
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListHeaderComponent={showFilter ? <FilterForm /> : null}
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={{ marginTop: vh(10) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listTrainingDetais(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          if (!nextPageAvailable || pagination || initialCall) return;
          setPagination(true);
          listTrainingDetais(page + 1, false, search, currentAppliedFilters);
        }}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default TraineeReleaseList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  headerWrap: {
    paddingHorizontal: vw(16),
  },
  searchBox: {
    marginTop: vh(10),
  },
  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(20),
  },
  filterContainer: {
    paddingHorizontal: vw(15),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(5),
  },
  applyBtn: {
    width: vw(150),
    height: vh(35),
  },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(14),
    borderRadius: vw(14),
    paddingHorizontal: vw(15),
    paddingVertical: vh(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: vw(8),
  },
  initialCircle: {
    width: vw(34),
    height: vw(34),
    borderRadius: vw(17),
    backgroundColor: '#DCEBFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(10),
  },
  initialText: {
    color: '#3E5F86',
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(15),
  },
  headerTextBlock: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(15.5),
    color: '#1F2328',
    marginTop: vh(1),
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: vw(32),
    height: vw(32),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E3E5E8',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw(8),
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: vh(18),
  },
  topInfoItem: {
    flex: 1,
    paddingRight: vw(10),
  },
  statLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12.5),
    color: '#8A8D91',
  },
  statValue: {
    marginTop: vh(5),
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(15),
    color: '#2A2E33',
  },
  programBlock: {
    marginTop: vh(12),
  },
  programText: {
    marginTop: vh(4),
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    lineHeight: vw(19),
    color: '#2A2E33',
  },
  gridRow: {
    flexDirection: 'row',
    marginTop: vh(10),
  },
  gridItem: {
    flex: 1,
    paddingRight: vw(10),
  },
  metaLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12.5),
    color: '#8A8D91',
  },
  metaValue: {
    marginTop: vh(4),
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#2A2E33',
  },
  viewMoreText: {
    marginTop: vh(14),
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#CD9F3E',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
});
