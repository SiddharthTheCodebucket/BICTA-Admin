import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  adminFontSizes,
  colors,
  fonts,
  images,
  screensName,
  strings,
  SvgEditPencile,
  SvgMerge,
  SvgSearch,
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
import ImageAtom from '../../../../../../components/atoms/ImageAtom';

import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import {
  useListTrainingBatchDetailsMutation,
  useUpdateTrainingBatchDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { globalStyles } from '../../../../../../utils/globalStyles';

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

const BatchDetails = (props: Props) => {
  const { navigation } = props;

  const [listTrainingNameApi] = useCommonDropdownListMutation();
  const [listTrainingBatchDetailsApi] = useListTrainingBatchDetailsMutation();
  const [updateTrainingBatchDetailsApi] =
    useUpdateTrainingBatchDetailsMutation();

  const [initialCall, setInitialCall] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState(false);

  const [trainings, setTrainings] = useState<any[]>([]);
  const [selectedTraining, setSelectedTraining] = useState<any>(null);
  const [showTrainingPicker, setShowTrainingPicker] = useState(false);

  const [batches, setBatches] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  const [activeTab, setActiveTab] = useState<
    'Current Training' | 'Completed Training'
  >('Current Training');

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Training Management',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      const isActive = String(t?.isCourseActive).toLowerCase() === 'yes';
      return activeTab === 'Current Training' ? isActive : !isActive;
    });
  }, [activeTab, trainings]);

  const listTrainingNames = useCallback(() => {
    setInitialCall(true);

    const searchValue = search?.trim() ? `%${search.trim()}%` : `%%`;

    const params: any = {
      listType: 'batch_details_training_name_list',
      replacements: [searchValue],
    };

    listTrainingNameApi(params)
      .unwrap()
      .then((res: any) => {
        setTrainings(res?.data ?? []);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      })
      .finally(() => {
        setInitialCall(false);
        setRefreshing(false);
      });
  }, [listTrainingNameApi, search]);

  useFocusEffect(
    useCallback(() => {
      listTrainingNames();
    }, [listTrainingNames]),
  );

  useEffect(() => {
    if (!filteredTrainings.length) {
      setSelectedTraining(null);
      setBatches([]);
      return;
    }

    if (
      !selectedTraining ||
      !filteredTrainings.some(t => t?.id === selectedTraining?.id)
    ) {
      setSelectedTraining(filteredTrainings[0]);
    }
  }, [filteredTrainings, selectedTraining]);

  const listBatches = useCallback(
    (pageNumber: number, initial: boolean) => {
      if (!selectedTraining?.id) return;
      initial ? setInitialCall(true) : setInitialCall(false);

      const params: any = {
        search: '',
        sort: {
          attributes: ['created_date'],
          sorts: ['asc'],
        },
        filters: ['trainingNameId', '=', selectedTraining.id],
        pageNo: pageNumber,
        itemsPerPage: ITEMS_PER_PAGE,
        bipardCentre: [],
      };

      listTrainingBatchDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          const newData = res?.data?.data ?? [];
          const totalCount = res?.data?.totalCount ?? 0;

          setBatches(prev =>
            pageNumber === 1 ? newData : [...prev, ...newData],
          );
          setPage(pageNumber);
          setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
        })
        .catch((err: any) => {
          Toast.show({
            type: 'error',
            text2: err?.data?.message || 'Something went wrong',
          });
        })
        .finally(() => {
          setInitialCall(false);
          setPagination(false);
          setRefreshing(false);
        });
    },
    [listTrainingBatchDetailsApi, selectedTraining?.id],
  );

  useEffect(() => {
    if (!selectedTraining?.id) return;
    listBatches(1, true);
  }, [listBatches, selectedTraining?.id]);

  const handleSearch = useCallback(
    debounce(() => {
      listTrainingNames();
    }, 500),
    [listTrainingNames],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch();
  };

  const onClearSearch = () => {
    setSearch('');
    listTrainingNames();
  };

  const confirmChangeStatus = (batchItem: any, next: 'Active' | 'Inactive') => {
    const current = String(batchItem?.action ?? 'Active').toLowerCase();
    const isActive = current === 'active';
    if (isActive && next === 'Active') return;
    if (!isActive && next === 'Inactive') return;

    navigation.navigate(screensName.AlertOrganism, {
      title: 'Status Change Confirmation',
      message: 'Are you sure you want to change this item?',
      okText: 'Confirm',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => toggleStatus(batchItem?.id),
      cancelFunction: () => {},
    });
  };

  const toggleStatus = (id: any) => {
    if (!id) return;
    setInitialCall(true);

    updateTrainingBatchDetailsApi({ id_for_change_status: id })
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res?.data?.message ?? 'Updated',
        });
        listBatches(1, true);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      })
      .finally(() => setInitialCall(false));
  };

  const renderBatchCard = ({ item }: any) => {
    const statusRaw = String(item?.action ?? 'Active').toLowerCase();
    const isActive = statusRaw === 'active';

    return (
      <View style={styles.batchCard}>
        <View style={styles.batchHeaderRow}>
          <TextAtom numberOfLines={1} style={styles.batchTitle}>
            {item?.batchName || `Batch ${item?.batchNo ?? ''}` || '-'}
          </TextAtom>

          <View style={styles.batchActionsRow}>
            <TouchableAtom
              onPress={() =>
                navigation.navigate(screensName.MergedBatchForm, {
                  item,
                  onDone: () => listBatches(1, true),
                })
              }
            >
              <SvgMerge />
            </TouchableAtom>

            <TouchableAtom
              style={{ marginLeft: vw(10) }}
              onPress={() =>
                navigation.navigate(screensName.EditBatchDetails, {
                  item,
                  onDone: () => listBatches(1, true),
                })
              }
            >
              <SvgEditPencile />
            </TouchableAtom>
          </View>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <TextAtom style={styles.label}>Start & End Date</TextAtom>
            <TextAtom style={styles.value}>
              {`${item?.dateFrom ?? '-'} - ${item?.dateTo ?? '-'}`}
            </TextAtom>
          </View>
          <View style={[styles.col]}>
            <TextAtom style={styles.label}>Batch Number</TextAtom>
            <TextAtom style={styles.value}>{item?.batchNo ?? '-'}</TextAtom>
          </View>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <TextAtom style={styles.label}>Batch Location</TextAtom>
            <TextAtom numberOfLines={1} style={styles.value}>
              {item?.batchLocation ?? '-'}
            </TextAtom>
          </View>
          <View style={[styles.col]}>
            <TextAtom style={styles.label}>Coordinator</TextAtom>
            <TextAtom numberOfLines={1} style={styles.value}>
              {item?.coordinator ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <TextAtom style={styles.label}>Admin</TextAtom>
            <TextAtom numberOfLines={1} style={styles.value}>
              {item?.admin ?? '-'}
            </TextAtom>
          </View>
          <View style={[styles.col]}>
            <TextAtom style={styles.label}>Max Candidate</TextAtom>
            <TextAtom style={styles.value}>
              {item?.maximumCandidate ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <TextAtom style={styles.label}>Trainee Count</TextAtom>
            <TextAtom style={styles.value}>
              {item?.totalRegisteredTrainees ?? '-'}
            </TextAtom>
          </View>

          <View style={[styles.col]}>
            <TextAtom style={styles.label}>Status</TextAtom>
            <View style={globalStyles.switchPillRow}>
              <TouchableAtom
                style={[
                  globalStyles.switchPill,
                  isActive
                    ? globalStyles.switchPillActive
                    : globalStyles.switchPillInactive,
                ]}
                onPress={() => confirmChangeStatus(item, 'Active')}
              >
                <TextAtom
                  style={[
                    globalStyles.switchPillText,
                    isActive
                      ? globalStyles.switchPillTextActive
                      : globalStyles.switchPillTextInactive,
                  ]}
                >
                  Active
                </TextAtom>
              </TouchableAtom>

              <TouchableAtom
                style={[
                  globalStyles.switchPill,
                  !isActive
                    ? globalStyles.switchPillActive
                    : globalStyles.switchPillInactive,
                ]}
                onPress={() => confirmChangeStatus(item, 'Inactive')}
              >
                <TextAtom
                  style={[
                    globalStyles.switchPillText,
                    !isActive
                      ? globalStyles.switchPillTextActive
                      : globalStyles.switchPillTextInactive,
                  ]}
                >
                  Inactive
                </TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <TextAtom style={styles.headerTitle}>Batch Details</TextAtom>
          <TextAtom style={styles.headerCount}>
            ({filteredTrainings.length})
          </TextAtom>
        </View>

        <TouchableAtom
          style={styles.headerIconBtn}
          onPress={() => setShowSearch(prev => !prev)}
        >
          <SvgSearch />
        </TouchableAtom>
      </View>

      {showSearch && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={styles.searchBox}
        />
      )}

      <View style={styles.statusTabWrap}>
        {(['Current Training', 'Completed Training'] as const).map(tab => (
          <TouchableAtom
            key={tab}
            style={[
              styles.statusTab,
              activeTab === tab && styles.statusTabActive,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <TextAtom
              style={[
                styles.statusTabText,
                activeTab === tab && styles.statusTabTextActive,
              ]}
            >
              {tab}
            </TextAtom>
          </TouchableAtom>
        ))}
      </View>

      <TouchableAtom
        style={styles.trainingSelect}
        activeOpacity={0.9}
        onPress={() => setShowTrainingPicker(true)}
      >
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.trainingLabel}>Training Name</TextAtom>
          <TextAtom numberOfLines={1} style={styles.trainingValue}>
            {selectedTraining?.name || '-'}
          </TextAtom>
          <TextAtom style={styles.trainingSub}>
            {selectedTraining?.totalBatch
              ? `${selectedTraining.totalBatch} Batch`
              : ''}
          </TextAtom>
        </View>
        <ImageAtom source={images.downArrow} style={styles.downIcon} />
      </TouchableAtom>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={batches}
        renderItem={renderBatchCard}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
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
            style={{ marginTop: vh(12) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listTrainingNames();
              listBatches(1, true);
            }}
          />
        }
        onEndReached={() => {
          if (!nextPageAvailable || pagination || initialCall) return;
          setPagination(true);
          listBatches(page + 1, false);
        }}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />

      <Modal
        visible={showTrainingPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTrainingPicker(false)}
      >
        <View style={styles.pickerRoot}>
          <Pressable
            style={styles.pickerOverlay}
            onPress={() => setShowTrainingPicker(false)}
          />
          <View style={styles.pickerSheet}>
            <TextAtom style={styles.pickerTitle}>Select Training</TextAtom>

            <FlatList
              data={filteredTrainings}
              keyExtractor={(it, idx) => (it?.id ? String(it.id) : String(idx))}
              renderItem={({ item }) => (
                <TouchableAtom
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedTraining(item);
                    setShowTrainingPicker(false);
                  }}
                >
                  <TextAtom numberOfLines={2} style={styles.pickerItemText}>
                    {item?.name || '-'}
                  </TextAtom>
                  {!!item?.totalBatch && (
                    <TextAtom style={styles.pickerItemSub}>
                      {item.totalBatch} Batch
                    </TextAtom>
                  )}
                </TouchableAtom>
              )}
              ItemSeparatorComponent={() => (
                <View style={{ height: 1, backgroundColor: '#EEF1F4' }} />
              )}
              style={{ maxHeight: vh(300) }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BatchDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },

  headerRow: {
    marginTop: vh(10),
    paddingHorizontal: vw(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontFamily: fonts.Inter_Bold,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_heading,
  },
  headerCount: {
    marginLeft: vw(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_count,
  },
  headerIconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    width: vw(17),
    height: vw(17),
    tintColor: colors.new_ui_icon,
  },

  searchBox: {
    marginTop: vh(10),
  },

  statusTabWrap: {
    marginTop: vh(10),
    marginHorizontal: vw(14),
    padding: vw(2),
    borderRadius: vw(8),
    backgroundColor: '#DCE8F6',
    flexDirection: 'row',
  },
  statusTab: {
    flex: 1,
    height: vh(34),
    borderRadius: vw(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabActive: {
    backgroundColor: colors.primary_blue,
  },
  statusTabText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: '#3D4B5C',
  },
  statusTabTextActive: {
    color: colors.white,
  },

  trainingSelect: {
    marginTop: vh(10),
    marginHorizontal: vw(14),
    borderRadius: vw(12),
    borderWidth: 1,
    borderColor: '#E2E5EA',
    backgroundColor: colors.white,
    paddingHorizontal: vw(12),
    paddingVertical: vh(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainingLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
    color: '#8A9099',
  },
  trainingValue: {
    marginTop: vh(2),
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
  },
  trainingSub: {
    marginTop: vh(2),
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
    color: '#8A9099',
  },
  downIcon: {
    width: vw(14),
    height: vw(14),
    tintColor: colors.new_ui_icon,
    marginLeft: vw(10),
  },

  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(20),
  },

  batchCard: {
    backgroundColor: colors.white,
    marginHorizontal: vw(14),
    borderRadius: vw(12),
    borderWidth: 1,
    borderColor: '#ECEEF2',
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
  },
  batchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  batchTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.md,
    color: '#2F3742',
    marginRight: vw(10),
  },
  batchActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: vw(28),
    height: vw(28),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E2E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F9',
    marginLeft: vw(8),
  },
  iconSmall: {
    width: vw(14),
    height: vw(14),
    tintColor: colors.new_ui_icon,
  },

  twoColRow: {
    flexDirection: 'row',
    marginTop: vh(10),
  },
  col: {
    flex: 1,
    paddingRight: vw(10),
  },
  colRight: {
    alignItems: 'flex-end',
    paddingRight: 0,
  },
  label: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
    color: '#8A9099',
    marginBottom: vh(2),
  },
  value: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
  },

  statusPillsRow: {
    flexDirection: 'row',
    marginTop: vh(2),
    justifyContent: 'flex-end',
  },
  statusPill: {
    height: vh(22),
    borderRadius: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw(10),
    marginLeft: vw(8),
  },
  statusPillActive: {
    backgroundColor: colors.primary_blue,
  },
  statusPillInactive: {
    backgroundColor: '#CFE2F7',
  },
  statusPillText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.xs,
  },
  statusPillTextActive: {
    color: colors.white,
  },
  statusPillTextInactive: {
    color: '#23406A',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },

  pickerRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: vw(18),
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pickerSheet: {
    backgroundColor: colors.white,
    borderRadius: vw(14),
    paddingVertical: vh(12),
    paddingHorizontal: vw(12),
  },
  pickerTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.md,
    color: '#2F3742',
    marginBottom: vh(10),
  },
  pickerItem: {
    paddingVertical: vh(10),
  },
  pickerItemText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
  },
  pickerItemSub: {
    marginTop: vh(2),
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
    color: '#8A9099',
  },
});
