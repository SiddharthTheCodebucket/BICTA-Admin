import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {
  colors,
  adminFontSizes,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
  SvgCross,
  SvgSearch,
  SvgFilterLines,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import UniversalDropdown from '../../../../../../components/atoms/UniversalDropdown';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import { useAppSelector } from '../../../../../../hooks';
import {
  useDeleteTrainingDetailsMutation,
  useListTrainingDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';

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

const TrainingDetails = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [listTrainingDetailsApi] = useListTrainingDetailsMutation();
  const [deleteTrainingDetailsApi] = useDeleteTrainingDetailsMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [centerSearch, setCenterSearch] = useState<any>({});
  const [showSearch, setShowSearch] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [activeStatus, setActiveStatus] = useState<
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

  const getCentreFilter = useCallback(() => {
    if (!centerSearch?.name) return null;
    if (centerSearch.name === 'All Centers') return ['Gaya', 'Patna'];
    return [centerSearch.name];
  }, [centerSearch]);

  const buildDateFilters = useCallback(() => {
    const filters: any[] = [];

    if (startDate) {
      const formatted = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['courseStartDate', '>=', formatted]);
    }

    if (endDate) {
      const formatted = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      filters.push(['courseEndDate', '<=', formatted]);
    }

    return filters;
  }, [startDate, endDate]);

  const listTrainingDetails = useCallback(
    (
      pageNumber: number,
      initial: boolean,
      keyword: string,
      forcedFilters?: any[],
    ) => {
      initial ? setInitialCall(true) : setInitialCall(false);

      const params: any = {
        search: keyword,
        sort: {
          attributes: ['created_at'],
          sorts: ['desc'],
        },
        filters: forcedFilters ?? buildDateFilters(),
        pageNo: pageNumber,
        itemsPerPage: ITEMS_PER_PAGE,
        bipardCentre: getCentreFilter() ?? [],
        isCourseActive: activeStatus === 'Current Training',
      };

      listTrainingDetailsApi(params)
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
    [activeStatus, buildDateFilters, getCentreFilter, listTrainingDetailsApi],
  );

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad) {
        setFirstTimeLoad(false);
        listTrainingDetails(1, true, search);
      }
    }, [firstTimeLoad, listTrainingDetails, search]),
  );

  useEffect(() => {
    if (firstTimeLoad) return;
    listTrainingDetails(1, true, search);
  }, [activeStatus, centerSearch?.name]);

  const handleSearch = useCallback(
    debounce((text: string) => {
      listTrainingDetails(1, true, text);
    }, 500),
    [listTrainingDetails],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTrainingDetails(1, true, '');
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setCenterSearch({});
    listTrainingDetails(1, true, search, []);
  };

  const applyFilter = () => {
    listTrainingDetails(1, true, search, buildDateFilters());
    setShowFilterPanel(false);
  };

  const handleDelete = (id: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this item?',
      okText: 'Confirm',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => deleteTrainingDetails(id),
      cancelFunction: () => {},
    });
  };

  const deleteTrainingDetails = (id: any) => {
    setInitialCall(true);

    deleteTrainingDetailsApi({ course_id: id })
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res?.data?.message,
        });
        listTrainingDetails(1, true, search);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const renderTrainingCard = ({ item }: any) => {
    const locationRaw =
      item?.isLocationRequired ??
      item?.locationRequired ??
      item?.isCourseLocationRequired ??
      item?.locationRequiredForCourse;

    const isLocationRequired =
      locationRaw === true ||
      locationRaw === 1 ||
      String(locationRaw).toLowerCase() === 'yes';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <TextAtom numberOfLines={1} style={styles.cardTitle}>
            {item?.trainingCategory || '-'}
          </TextAtom>

          <View style={styles.cardActionsRow}>
            <TouchableAtom
              style={[styles.cardIconBtn, styles.cardDeleteBtn]}
              onPress={() => handleDelete(item?.id)}
            >
              <ImageAtom source={images.delete} style={styles.deleteIcon} />
            </TouchableAtom>

            <TouchableAtom
              style={styles.cardIconBtn}
              onPress={() =>
                navigation.navigate(screensName.AddTrainingDetails, { item })
              }
            >
              <ImageAtom source={images.edit_pencil} style={styles.editIcon} />
            </TouchableAtom>
          </View>
        </View>

        <TextAtom numberOfLines={2} style={styles.cardSubTitle}>
          {item?.trainingFullName || '-'}
        </TextAtom>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <TextAtom style={styles.metaLabel}>Start & End Date</TextAtom>
            <TextAtom style={styles.metaValue}>
              {`${moment(item?.courseStartDate).format('DD/MM/YY')} - ${moment(
                item?.courseEndDate,
              ).format('DD/MM/YY')}`}
            </TextAtom>
          </View>

          <View style={styles.metaCol}>
            <TextAtom style={styles.metaLabel}>Participants</TextAtom>
            <TextAtom style={styles.metaValue}>
              {item?.noOfParticipants || '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <TextAtom style={styles.metaLabel}>Total Registration</TextAtom>
            <TextAtom style={styles.metaValue}>
              {item?.totalRegisteredTrainees || '-'}
            </TextAtom>
          </View>

          <View style={styles.metaCol}>
            <TextAtom style={styles.metaLabel}>Sections Batches</TextAtom>
            <TextAtom style={styles.metaValue}>
              {item?.noOfSections || '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <TextAtom style={styles.metaLabel}>Course Coordinator</TextAtom>
            <TextAtom numberOfLines={1} style={styles.metaValueBold}>
              {item?.courseCoordinator || '-'}
            </TextAtom>
          </View>

          <View style={styles.metaCol}>
            <TextAtom style={styles.metaLabel}>Location Required</TextAtom>
            <View style={styles.locationPillRow}>
              <View
                style={[
                  styles.locationPill,
                  isLocationRequired
                    ? styles.locationPillActive
                    : styles.locationPillInactive,
                ]}
              >
                <TextAtom
                  style={[
                    styles.locationPillText,
                    isLocationRequired
                      ? styles.locationPillTextActive
                      : styles.locationPillTextInactive,
                  ]}
                >
                  Yes
                </TextAtom>
              </View>
              <View
                style={[
                  styles.locationPill,
                  !isLocationRequired
                    ? styles.locationPillActive
                    : styles.locationPillInactive,
                ]}
              >
                <TextAtom
                  style={[
                    styles.locationPillText,
                    !isLocationRequired
                      ? styles.locationPillTextActive
                      : styles.locationPillTextInactive,
                  ]}
                >
                  No
                </TextAtom>
              </View>
            </View>
          </View>
        </View>

        <TouchableAtom
          style={styles.viewMoreBtn}
          onPress={() =>
            navigation.navigate(screensName.TrainingDetailsScreen, {
              data: item,
              onDone: () => listTrainingDetails(1, true, search),
            })
          }
        >
          <TextAtom style={styles.viewMoreText}>View More</TextAtom>
        </TouchableAtom>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <TextAtom style={styles.headerTitle}>Training Details</TextAtom>
          <TextAtom style={styles.headerCount}>({totalCount})</TextAtom>
        </View>

        <View style={styles.actionsRow}>
          <TouchableAtom
            style={styles.iconBtn}
            onPress={() => setShowSearch(prev => !prev)}
          >
            <SvgSearch width={vw(18)} height={vw(18)} />
          </TouchableAtom>

          <TouchableAtom
            style={styles.iconBtn}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setShowFilterPanel(true);
            }}
          >
            <SvgFilterLines />
          </TouchableAtom>

          <TouchableAtom
            style={styles.createButtonTouchable}
            onPress={() => navigation.navigate(screensName.AddTrainingDetails)}
          >
            <ImageBackground
              source={images.buttonGrad_25}
              style={styles.createButton}
              imageStyle={styles.createButtonImage}
              resizeMode="stretch"
            >
              <TextAtom style={styles.createButtonText}>+ Create</TextAtom>
            </ImageBackground>
          </TouchableAtom>
        </View>
      </View>

      {showSearch && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={styles.searchBox}
        />
      )}

      <Modal
        visible={showFilterPanel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterPanel(false)}
      >
        <View style={styles.filterModalRoot}>
          <Pressable
            style={styles.filterModalOverlay}
            onPress={() => setShowFilterPanel(false)}
          />

          <View style={styles.filterSheet}>
            <View style={styles.filterSheetHeader}>
              <TextAtom style={styles.filterSheetTitle}>Filters</TextAtom>
              <TouchableAtom
                style={styles.filterSheetCloseBtn}
                onPress={() => setShowFilterPanel(false)}
              >
                <SvgCross />
              </TouchableAtom>
            </View>

            {crediantialData?.user?.[0]?.tenantId === 3 && (
              <UniversalDropdown
                label="Center"
                placeholder="Select Center"
                data={[
                  { id: 'All Centers', name: 'All Centers' },
                  { id: 'Gaya', name: 'Gaya' },
                  { id: 'Patna', name: 'Patna' },
                ]}
                value={centerSearch?.id}
                onChange={(item: any) => setCenterSearch(item)}
                labelField="name"
                valueField="id"
                containerStyle={{ marginBottom: vh(2) }}
              />
            )}

            <DateInputOrganism
              label={'Start Date*'}
              placeholder={'Select'}
              value={startDate}
              onChangeText={(val: any) => setStartDate(val)}
              fieldName={'date'}
              dateFormat="DD-MM-YYYY"
              containerStyle={styles.fullDateInput}
            />

            <DateInputOrganism
              label={'End Date*'}
              placeholder={'Select'}
              value={endDate}
              onChangeText={(val: any) => setEndDate(val)}
              fieldName={'date'}
              dateFormat="DD-MM-YYYY"
              containerStyle={styles.fullDateInput}
            />

            <View style={styles.filterActionRow}>
              <TouchableAtom
                style={styles.clearFilterBtn}
                onPress={clearFilter}
              >
                <TextAtom style={styles.clearFilterText}>Clear</TextAtom>
              </TouchableAtom>
              <TouchableAtom
                style={styles.applyFilterBtn}
                onPress={applyFilter}
              >
                <TextAtom style={styles.applyFilterText}>Apply</TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.statusTabWrap}>
        <TouchableAtom
          style={[
            styles.statusTab,
            activeStatus === 'Current Training' && styles.statusTabActive,
          ]}
          onPress={() => setActiveStatus('Current Training')}
        >
          <TextAtom
            style={[
              styles.statusTabText,
              activeStatus === 'Current Training' && styles.statusTabTextActive,
            ]}
          >
            Current Training
          </TextAtom>
        </TouchableAtom>

        <TouchableAtom
          style={[
            styles.statusTab,
            activeStatus === 'Completed Training' && styles.statusTabActive,
          ]}
          onPress={() => setActiveStatus('Completed Training')}
        >
          <TextAtom
            style={[
              styles.statusTabText,
              activeStatus === 'Completed Training' &&
                styles.statusTabTextActive,
            ]}
          >
            Completed Training
          </TextAtom>
        </TouchableAtom>
      </View>

      <FlatList
        data={data}
        renderItem={renderTrainingCard}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        showsVerticalScrollIndicator={false}
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
              listTrainingDetails(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          if (!nextPageAvailable || pagination || initialCall) return;
          setPagination(true);
          listTrainingDetails(page + 1, false, search);
        }}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default TrainingDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },

  createButtonImage: {
    borderRadius: vw(8),
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
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  headerCount: {
    marginLeft: vw(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(8),
  },
  actionIcon: {
    width: vw(17),
    height: vw(17),
    tintColor: colors.new_ui_icon,
  },
  filterGlyph: {
    alignItems: 'flex-end',
  },
  filterLine: {
    height: vh(2),
    backgroundColor: colors.new_ui_icon,
    marginVertical: vh(1),
    borderRadius: vw(2),
  },

  createButtonTouchable: {
    borderRadius: vw(8),
    overflow: 'hidden',
  },
  createButton: {
    paddingHorizontal: vw(14),
    paddingVertical: vh(9),
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: colors.white,
  },

  searchBox: {
    marginTop: vh(10),
  },

  filterModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filterModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  filterSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: vw(18),
    borderTopRightRadius: vw(18),
    paddingHorizontal: vw(16),
    paddingTop: vh(14),
    paddingBottom: vh(18),
  },
  filterSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },
  filterSheetTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  filterSheetCloseBtn: {
    width: vw(28),
    height: vw(28),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: vw(16),
    height: vw(16),
    tintColor: colors.new_ui_icon,
  },

  centerBtn: {
    height: vh(42),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E1E4E8',
    backgroundColor: '#F2F3F5',
    paddingHorizontal: vw(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(8),
  },
  centerBtnText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: '#344054',
  },
  centerBtnPlaceholder: {
    color: '#B3BCC8',
  },
  centerBtnIcon: {
    width: vw(14),
    height: vw(14),
    tintColor: '#1F2937',
  },
  fullDateInput: {
    marginTop: vh(8),
  },
  filterActionRow: {
    marginTop: vh(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearFilterBtn: {
    borderWidth: 1,
    borderColor: '#C9D3E1',
    borderRadius: vw(10),
    paddingVertical: vh(12),
    width: '48%',
    alignItems: 'center',
  },
  clearFilterText: {
    color: '#2F3742',
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
  },
  applyFilterBtn: {
    borderRadius: vw(10),
    backgroundColor: colors.primary_blue,
    paddingVertical: vh(12),
    width: '48%',
    alignItems: 'center',
  },
  applyFilterText: {
    color: colors.white,
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
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

  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(20),
  },

  card: {
    backgroundColor: '#F8F8F9',
    marginHorizontal: vw(14),
    borderRadius: vw(12),
    borderWidth: 1,
    borderColor: '#ECEEF2',
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: '#2F3742',
    marginRight: vw(8),
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBtn: {
    width: vw(24),
    height: vw(24),
    borderRadius: vw(6),
    borderWidth: 1,
    borderColor: '#E2E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginLeft: vw(8),
  },
  cardDeleteBtn: {
    borderColor: '#F3D7D7',
  },
  deleteIcon: {
    width: vw(12),
    height: vw(12),
    tintColor: '#FF6B6B',
  },
  editIcon: {
    width: vw(12),
    height: vw(12),
    tintColor: '#6D7581',
  },
  cardSubTitle: {
    marginTop: vh(2),
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: '#737A84',
  },

  metaRow: {
    marginTop: vh(8),
    flexDirection: 'row',
  },
  metaCol: {
    flex: 1,
    paddingRight: vw(10),
  },
  metaLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: '#8A9099',
    marginBottom: vh(2),
  },
  metaValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#49505A',
  },
  metaValueBold: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: '#3B424E',
  },

  locationPillRow: {
    flexDirection: 'row',
    marginTop: vh(2),
  },
  locationPill: {
    minWidth: vw(26),
    height: vh(20),
    borderRadius: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(4),
    paddingHorizontal: vw(5),
  },
  locationPillActive: {
    backgroundColor: colors.primary_blue,
  },
  locationPillInactive: {
    backgroundColor: '#CFE2F7',
  },
  locationPillText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.xs,
  },
  locationPillTextActive: {
    color: colors.white,
  },
  locationPillTextInactive: {
    color: '#23406A',
  },

  viewMoreBtn: {
    marginTop: vh(10),
    alignSelf: 'flex-start',
  },
  viewMoreText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: '#D7A95A',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
});
