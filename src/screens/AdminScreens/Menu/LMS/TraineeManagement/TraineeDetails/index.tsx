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
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
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
import {
  useDownloadTraineeDetailsMutation,
  useDownloadTraineeRegFormMutation,
  useDownloadTrainingCategoryMutation,
  useListTraineeDetailsMutation,
  useListTrainingBatchDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';

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

const TraineeDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [downloadApi] = useDownloadTrainingCategoryMutation();
  const [commonListApi] = useCommonDropdownListMutation();
  const [listTrainingBatchDetailsApi] = useListTrainingBatchDetailsMutation();
  const [listTraineeDetailsApi] = useListTraineeDetailsMutation();
  const [downloadTraineeRegFormApi] = useDownloadTraineeRegFormMutation();
  const [downloadTrainingDetailsApi] = useDownloadTraineeDetailsMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentAppliedFilters, setCurrentAppliedFilters] = useState([]);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [isForExcel, setIsForExcel] = useState(false);

  const [selectedItems, setSelectedItems] = useState<any>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [trainingList, setTrainingList] = useState<any>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>({});
  const [batchList, setBatchList] = useState<any>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>({});

  const [selectedPregnancy, setSelectedPregnancy] = useState<any>({});
  const [selectedIndeminityBond, setSelectedIndeminityBond] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [activeTab, setActiveTab] = useState<
    'Current Course' | 'Complete Course'
  >('Current Course');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Trainee Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTrainingDetais(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTrainingDetais(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    getTrainingList();
    listTrainingDetais(1, true, search);
  }, [activeTab]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;
    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }
    return [centerSerach.name];
  };

  const toggleFilter = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowFilter(!showFilter);
  };

  const listTrainingDetais = (
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
        attributes: ['batchNo'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,

      bipardCentre: [],
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    if (activeTab === 'Complete Course') {
      params.isCourseActive = false;
    } else {
      params.isCourseActive = true;
    }

    listTraineeDetailsApi(params)
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

        const totalCountApi = res?.data?.totalCount ?? 0;
        setTotalCount(totalCountApi);
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
      listTrainingDetais(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTrainingDetais(1, true, '');
  };

  const handleSelectAll = () => {
    if (!isFilterApplied) {
      Toast.show({
        type: 'error',
        text2: 'Please apply filter first',
      });
      return;
    }

    if (selectedItems.length === totalCount) {
      setSelectedItems([]);
      return;
    }

    const params: any = {
      search,
      sort: {
        attributes: ['batchNo'],
        sorts: ['desc'],
      },
      filters: currentAppliedFilters,
      pageNo: 1,
      itemsPerPage: totalCount,
      bipardCentre: getCentreFilter() ?? [],
    };

    if (activeTab === 'Complete Course') params.isCourseActive = false;
    else params.isCourseActive = true;

    listTraineeDetailsApi(params)
      .unwrap()
      .then(res => {
        const fullData = res.data?.data ?? [];
        setSelectedItems(fullData);
      });
  };

  const handleSelectExcel = () => {
    if (selectedItems.length === totalCount) {
      setSelectedItems([]);
      return;
    }

    const params: any = {
      search,
      sort: {
        attributes: ['batchNo'],
        sorts: ['desc'],
      },
      filters: currentAppliedFilters,
      pageNo: 1,
      itemsPerPage: totalCount,
      bipardCentre: getCentreFilter() ?? [],
    };

    if (activeTab === 'Complete Course') params.isCourseActive = false;
    else params.isCourseActive = true;

    listTraineeDetailsApi(params)
      .unwrap()
      .then(res => {
        const fullData = res.data?.data ?? [];
        setSelectedItems(fullData);
      });
  };

  const downloadTraining = async () => {
    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Please select trainees first',
      });
      return;
    }

    setInitialCall(true);

    const traineeIds = selectedItems.map((x: any) => x.traineeId);

    const trainingId = selectedItems[0]?.nameOfTrainingProgrammeId;

    const params: any = {
      trainingId: trainingId,
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: [['traineeId', 'IN', traineeIds]],
      pageNo: 1,
      itemsPerPage: traineeIds.length,
    };

    downloadApi(params)
      .unwrap()
      .then((res: any) => {
        setInitialCall(false);

        const fileUrl = res.data?.fileUrl ?? '';
        const zipUrl = res.data?.zipFileUrl ?? '';

        downloadAndOpenFile(fileUrl || zipUrl);

        setSelectedItems([]);
        listTrainingDetais(1, true, search);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const downloadTraineeRegForm = async (item: any) => {
    setInitialCall(true);
    const params: any = {
      trainingId: item.nameOfTrainingProgrammeId,
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: [['traineeId', 'IN', [item.traineeId]]],
      pageNo: 1,
      itemsPerPage: 10,
    };
    downloadTraineeRegFormApi(params)
      .unwrap()
      .then((res: any) => {
        setInitialCall(false);
        const pdfFileUrl = res.data?.pdfFileUrl ?? '';
        const zipFileUrl = res.data?.zipFileUrl ?? '';
        if (pdfFileUrl) {
          downloadAndOpenFile(pdfFileUrl);
        } else {
          downloadAndOpenFile(zipFileUrl);
        }
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };
  const toggleSelect = (item: any) => {
    const exists = selectedItems.some(
      (x: any) => x.traineeId === item.traineeId,
    );

    if (exists) {
      setSelectedItems((prev: any) =>
        prev.filter((x: any) => x.traineeId !== item.traineeId),
      );
    } else {
      setSelectedItems((prev: any) => [...prev, item]);
    }
  };

  const TraineeCard = ({ item, index, isSelected }: any) => {
    return (
      <TouchableAtom
        onPress={() => toggleSelect(item)}
        onLongPress={() => {
          navigation.navigate(screensName.TraineeFullDetails, {
            data: item,
          });
        }}
        delayLongPress={180}
        style={[styles.card, isSelected && styles.selectedCard]}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, { flex: 1 }]}>
            Sr. No: {index + 1}
          </TextAtom>
          <TextAtom style={[styles.label, { flex: 1, textAlign: 'right' }]}>
            Training Id: {item.traineeId || '-'}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Name Of Training Programme</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.nameOfTrainingProgramme || '-'}
          </TextAtom>
        </View>

        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <TextAtom style={styles.label}>Name</TextAtom>
            <TextAtom style={styles.value}>{item.name}</TextAtom>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TextAtom style={styles.labelRight}>Batch No</TextAtom>
            <TextAtom style={styles.valueRight}>{item.batchName}</TextAtom>
          </View>
        </View>
        <View style={[styles.rowBetween]}>
          <TouchableAtom
            style={[
              styles.filterButton,
              {
                borderColor:
                  item.isTraineeIndemnityBondSubmitted === 'No'
                    ? colors.red
                    : colors.green,
              },
            ]}
            onPress={() => {
              if (item.isTraineeIndemnityBondSubmitted === 'No') {
                Toast.show({
                  type: 'error',
                  text2: 'Indemnity bond not filled',
                });
              } else {
                navigation.navigate(screensName.IndemnityBond, { item: item });
              }
            }}
          >
            <TextAtom
              style={{
                color:
                  item.isTraineeIndemnityBondSubmitted === 'No'
                    ? colors.red
                    : colors.green,
                fontFamily: fonts.Roboto_Medium,
                fontSize: vw(12),
              }}
            >
              Indemnity Bond
            </TextAtom>
          </TouchableAtom>

          <TouchableAtom
            style={styles.filterButton}
            onPress={() => {
              downloadTraineeRegForm(item);
            }}
          >
            <ImageAtom
              source={images.download}
              style={{ tintColor: colors.black, width: vw(14), height: vw(14) }}
            />
          </TouchableAtom>
        </View>
      </TouchableAtom>
    );
  };

  const renderListRoomDetails = ({ item, index }: any) => {
    return (
      <TraineeCard
        item={item}
        index={index}
        navigation={navigation}
        isSelected={selectedItems.some(
          (x: any) => x.traineeId === item.traineeId,
        )}
      />
    );
  };

  const getTrainingList = () => {
    setInitialCall(true);
    const params = {
      listType: 'list-all-training',
      bipardCentre: ['Gaya', 'Patna'],
      replacements: ['%%'],
    };
    commonListApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainingList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const listTrainingBatchDetails = (id: any) => {
    setInitialCall(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['asc'],
      },
      filters: ['trainingNameId', '=', id],
      pageNo: 1,
      itemsPerPage: null,
      bipardCentre: [],
    };
    listTrainingBatchDetailsApi(params)
      .unwrap()
      .then((res: any) => {
        setBatchList(res.data.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };
  const downloadExcel = async () => {
    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Please select',
      });
      return;
    }

    setInitialCall(true);
    let parmas = {
      trainee: selectedItems,
    };
    downloadTrainingDetailsApi(parmas)
      .unwrap()
      .then((res: any) => {
        setInitialCall(false);

        const fileUrl = res?.data?.fileUrl;
        if (fileUrl) {
          downloadAndOpenFile(fileUrl);
        }
        setIsForExcel(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
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
            setSelectedData: (data: any) => {
              setSelectedTraining(data);
              setSelectedBatch({});
              listTrainingBatchDetails(data.id);
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
            setSelectedData: (data: any) => {
              setSelectedBatch(data);
            },
            typeName: 'batchName',
            typeId: 'id',
          });
        }}
        inputText={selectedBatch?.batchName}
      />

      <DropDownOrganism
        label={'Pregnancy'}
        placeholder={'Pregnancy'}
        onPress={() => {
          navigation.navigate('DropDownModal', {
            name: 'Pregnancy',
            Data: [
              { id: 'Yes', name: 'Yes' },
              { id: 'No', name: 'No' },
            ],
            selectedData: selectedPregnancy,
            setSelectedData: (data: any) => {
              setSelectedPregnancy(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedPregnancy?.name}
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
            setSelectedData: (data: any) => {
              setSelectedIndeminityBond(data);
            },
            typeName: 'name',
            typeId: 'id',
          });
        }}
        inputText={selectedIndeminityBond?.name}
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
  const clearFilter = () => {
    setSelectedTraining({});
    setSelectedBatch({});
    setSelectedPregnancy({});
    setSelectedIndeminityBond({});
    setIsFilterApplied(false);
    listTrainingDetais(1, true, search, []);
  };

  const applyFilter = () => {
    const filters: any = [];

    if (selectedTraining?.id) {
      filters.push(['nameOfTrainingProgrammeId', '=', selectedTraining.id]);
    }
    if (selectedBatch?.id) {
      filters.push(['batchNoId', '=', selectedBatch.id]);
    }
    if (selectedPregnancy?.id) {
      filters.push(['pregnancyStatus', '=', selectedPregnancy.id]);
    }
    if (selectedIndeminityBond?.id) {
      filters.push([
        'isTraineeIndemnityBondSubmitted',
        '=',
        selectedIndeminityBond.id,
      ]);
    }

    setCurrentAppliedFilters(filters);
    setIsFilterApplied(true);

    listTrainingDetais(1, true, search, filters);
  };

  const handleDownloadClick = () => {
    if (!isFilterApplied) {
      Toast.show({
        type: 'error',
        text2: 'Please apply filter before downloading',
      });
      return;
    }

    if (selectedItems.length === 0) {
      Toast.show({
        type: 'error',
        text2: 'Please select items to download',
      });
      return;
    }

    downloadTraining();
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={{ height: 'auto' }}>
        <ScrollView showsVerticalScrollIndicator={false}>
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
                if (isForExcel) {
                  handleSelectExcel();
                } else {
                  handleSelectAll();
                }
              }}
            >
              <TextAtom style={styles.filterText}>
                {selectedItems?.length === totalCount
                  ? 'Unselect All'
                  : 'Select All'}
              </TextAtom>
            </TouchableAtom>

            <TouchableAtom
              style={styles.filterButton}
              onPress={() => {
                if (selectedItems.length === 0) {
                  setIsForExcel(true);
                  Toast.show({
                    type: 'error',
                    text2: 'Please select',
                  });
                  return null;
                } else {
                  downloadExcel();
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
                Excel
              </TextAtom>
            </TouchableAtom>
            <TouchableAtom
              style={styles.filterButton}
              onPress={handleDownloadClick}
            >
              <ImageAtom
                source={images.download}
                style={{ tintColor: colors.black }}
              />
            </TouchableAtom>
          </View>

          {crediantialData.user[0].tenantId === 3 && (
            <DropDownOrganism
              label={''}
              placeholder={'Centers'}
              onPress={() => {
                navigation.navigate('DropDownModal', {
                  name: 'Center',
                  Data: [
                    { id: 'All Centers', name: 'All Centers' },
                    { id: 'Gaya', name: 'Gaya' },
                    { id: 'Patna', name: 'Patna' },
                  ],
                  selectedData: centerSerach,
                  setSelectedData: setCenterSerach,
                  typeName: 'name',
                  typeId: 'id',
                });
              }}
              inputText={centerSerach?.name}
              containerStyle={{ marginBottom: vh(5) }}
            />
          )}
          <SearchBoxOrganism
            onChangeText={onChangeSearch}
            searchText={search}
            onPressCross={onClearSearch}
            searchBox={{ marginTop: vh(10) }}
          />
        </ScrollView>
      </View>
      <View style={styles.tabRow}>
        {['Current Course', 'Complete Course'].map(tab => (
          <TouchableAtom
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as any)}
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
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderListRoomDetails}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListHeaderComponent={<View>{showFilter && <FilterForm />}</View>}
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
              listTrainingDetais(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTrainingDetais(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default TraineeDetails;

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
    backgroundColor: '#EAEAEA',
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
  selectedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#F3F8FF',
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
    backgroundColor: '#ddffdd',
    borderColor: '#22aa22',
  },

  inActiveBox: {
    backgroundColor: '#ffdddd',
    borderColor: '#cc2222',
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },

  activeText: { color: '#008800' },
  inActiveText: { color: '#bb0000' },

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
});
