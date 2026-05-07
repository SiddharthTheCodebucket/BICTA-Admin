/* eslint-disable eslint-comments/no-unused-disable, no-unreachable, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
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
  Switch,
  TouchableOpacity,
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
import { SvgDownload, SvgEditPencile } from '../../../../../../constants/svgs';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import AdminListHeader from '../../../../../../components/organisms/AdminListHeader';
import FormSwitchForCard from '../../../../../../components/templates/FormSwitchForCard';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import SubTab from '../../../../../../components/molecules/SubTab';
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
import { useGetCentre } from '../../../../../../hooks/useGetCentre';

interface Props {
  navigation: NavigationType;
  headerTitle?: string;
  listTitle?: string;
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
  const { navigation, headerTitle = 'Trainee Details', listTitle } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const center = useGetCentre();

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

  const [activeTab, setActiveTab] = useState<'current' | 'complete'>('current');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, headerTitle);
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

    if (activeTab === 'complete') {
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

    if (activeTab === 'complete') params.isCourseActive = false;
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

    if (activeTab === 'complete') params.isCourseActive = false;
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
        // onPress={() => toggleSelect(item)}
        onPress={() => {
          navigation.navigate(screensName.TraineeFullDetails, {
            data: item,
          });
        }}
        // onLongPress={() => {
        //   navigation.navigate(screensName.TraineeFullDetails, {
        //     data: item,
        //   });
        // }}
        // delayLongPress={180}
        style={[
          styles.card,

          // isSelected && styles.selectedCard
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.initialCircle}>
              <TextAtom style={styles.initialText}>
                {item.name?.[0] || '?'}
              </TextAtom>
            </View>
            <TextAtom style={styles.cardName}>{item.name}</TextAtom>
          </View>
          <View style={styles.cardHeaderActions}>
            <TouchableOpacity onPress={() => {}}>
              <SvgDownload />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <SvgEditPencile />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <TextAtom style={styles.statLabel}>Attendance</TextAtom>
            <TextAtom style={styles.statValue}>30%</TextAtom>
          </View>
          <View style={{}}>
            <TextAtom style={styles.statLabel}>ID</TextAtom>
            <View style={{ flexDirection: 'row' }}>
              <View
                style={{
                  backgroundColor: colors.primary_sky_blue,
                  paddingHorizontal: vw(4),
                  marginRight: 2,

                  paddingVertical: vh(2),
                  borderRadius: 4,
                }}
              >
                <TextAtom style={styles.statValue}>
                  Training - {item.nameOfTrainingProgrammeId || '-'}
                </TextAtom>
              </View>
              <View
                style={{
                  backgroundColor: colors.primary_sky_blue,
                  paddingHorizontal: vw(6),
                  marginLeft: 2,
                  paddingVertical: vh(2),
                  borderRadius: 4,
                }}
              >
                <TextAtom style={styles.statValue}>
                  Trainee - {item.traineeId || '-'}
                </TextAtom>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.programContainer}>
          <TextAtom numberOfLines={2} style={styles.programText}>
            {item.nameOfTrainingProgramme || '-'}
          </TextAtom>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <TextAtom style={styles.gridLabel}>Father Name</TextAtom>
              <TextAtom style={styles.gridValue}>
                {item.fatherName || '-'}
              </TextAtom>
            </View>
            <View style={styles.gridItem}>
              <TextAtom style={styles.gridLabel}>Mother Name</TextAtom>
              <TextAtom style={styles.gridValue}>
                {item.motherName || '-'}
              </TextAtom>
            </View>
          </View>
          <View style={styles.gridRow}>
            <View style={styles.gridItem}>
              <TextAtom style={styles.gridLabel}>Designation</TextAtom>
              <TextAtom style={styles.gridValue}>
                {item.designation || '-'}
              </TextAtom>
            </View>
            <View style={styles.gridItem}>
              <TextAtom style={styles.gridLabel}>Mobile No.</TextAtom>
              <TextAtom style={styles.gridValue}>
                {item.mobileNo || '-'}
              </TextAtom>
            </View>
          </View>
        </View>

        <TouchableAtom
          style={{}}
          onPress={() => {
            navigation.navigate(screensName.TraineeFullDetails, {
              data: item,
            });
          }}
        >
          <TextAtom style={styles.footerText}>View More</TextAtom>
        </TouchableAtom>
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
      bipardCentre: center,
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
      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader
          config={{
            title: listTitle ?? 'Trainee Details',
            count: totalCount,
            showCount: true,
            search: { visible: true, onPress: () => setShowFilter(true) },
            filter: { visible: true, onPress: () => setShowFilter(true) },
          }}
        />
      </View>
      <SubTab
        tabs={[
          { label: 'Current Course', value: 'current' },
          { label: 'Complete Course', value: 'complete' },
        ]}
        activeTab={activeTab}
        onTabChange={value => setActiveTab(value as 'current' | 'complete')}
        style={{ marginTop: 10 }}
      />

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
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(15),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#F3F8FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(15),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
  },
  initialCircle: {
    width: vw(32),
    height: vw(32),
    borderRadius: vw(16),
    backgroundColor: colors.primary_sky_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: colors.primary_dark_blue,
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
  },
  cardName: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    color: colors.black,
  },
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
  },
  cardSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    padding: vw(10),
    borderRadius: vw(6),
    marginBottom: vh(15),
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: vw(10),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    marginBottom: vh(2),
  },
  statValue: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },
  programContainer: {
    marginBottom: vh(15),
  },
  programText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
    lineHeight: vw(18),
  },
  gridContainer: {
    marginBottom: vh(4),
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    marginBottom: vh(2),
  },
  gridValue: {
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Medium,
    color: colors.black,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.chinese_silver,
    paddingTop: vh(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: '#CD9F3E',
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
