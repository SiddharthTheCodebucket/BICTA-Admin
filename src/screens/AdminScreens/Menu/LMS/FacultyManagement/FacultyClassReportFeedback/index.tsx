import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import BottomSheet from '@gorhom/bottom-sheet';
import {
  adminFontSizes,
  colors,
  fonts,
  images,
  screensName,
  SvgCross,
  SvgFilterLines,
  SvgSearch,
  SvgStar,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';

import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useReportListFacultyFeedbackReportMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import { useFacultyCenter } from '../context/FacultyCenterContext';

interface Props {
  navigation: NavigationType;
}

const FacultyClassReportFeedback = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [reportListFacultyFeedbackReportApi] =
    useReportListFacultyFeedbackReportMutation();
  const [commonDropdownApi] = useCommonDropdownListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const filterSheetRef = useRef<BottomSheet>(null);
  const filterSnapPoints = useMemo(() => ['45%'], []);

  const [facultyNameList, setFacultyNameList] = useState<any>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const { center: centerSerach, setCenter: setCenterSerach } = useFacultyCenter();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openFilter = () => setShowFilter(true);
  const closeFilter = () => filterSheetRef.current?.close();

  const handleFilterSheetAnimate = useCallback(
    (_fromIndex: number, toIndex: number) => {
      if (toIndex === -1) setShowFilter(false);
    },
    [],
  );

  useLayoutEffect(() => {
    // Header handled by FacultyManagement tabbed screen
  }, [navigation]);

  const getCentreFilter = useCallback(() => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  }, [centerSerach]);

  const listFacultyFeedbackReports = useCallback((
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
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      exportFlag: true,
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    reportListFacultyFeedbackReportApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        setData((prev: any) =>
          pageNumber !== 1 ? [...prev, ...newData] : newData,
        );

        setPage(pageNumber);
        const count = res?.data?.totalCount ?? 0;
        setTotalCount(count);
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < count);
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
  }, [getCentreFilter, reportListFacultyFeedbackReportApi]);

  const onChangeSearch = (text: string) => {
    setSearch(text);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      listFacultyFeedbackReports(1, true, text);
    }, 500);
  };

  const onClearSearch = () => {
    setSearch('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    listFacultyFeedbackReports(1, true, '');
  };

  const StarRating = ({ rating }: any) => {
    if (rating !== undefined && rating !== null) {
      return (
        <ViewAtom style={styles.ratingValueRow}>
          <SvgStar width={vw(14)} height={vw(14)} />
          <TextAtom style={styles.ratingValueText}>{rating ?? '-'}</TextAtom>
        </ViewAtom>
      );
    }

    const rounded = Math.round(rating);

    const stars = new Array(5).fill(0).map((_, i) => (
      <TextAtom key={i.toString() + 'ewrio'} style={styles.starText}>
        {i < rounded ? '★' : '☆'}
      </TextAtom>
    ));

    return <ViewAtom style={styles.starContainer}>{stars}</ViewAtom>;
  };

  const FacultyFeedbackCard = ({ item, index: _index, navigation }: any) => {
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.FacultySubjectFeedbackDetails, {
            item: item,
          });
        }}
      >
        <TextAtom style={styles.cardTitle}>{item.facultyName ?? '-'}</TextAtom>

        <View style={styles.threeColRow}>
          <View style={styles.infoCol}>
            <TextAtom style={styles.infoLabel}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .classCount
              }
            </TextAtom>
            <TextAtom style={styles.infoValue}>
              {item.totalClassCount ?? '-'}
            </TextAtom>
          </View>

          <View style={styles.infoCol}>
            <TextAtom style={styles.infoLabel}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .rating
              }
            </TextAtom>
            <StarRating rating={item.rating ?? item.averageRating} />
          </View>

          <View style={styles.infoCol}>
            <TextAtom style={styles.infoLabel}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .averageRating
              }
            </TextAtom>
            <StarRating rating={item.averageRating} />
          </View>
        </View>
      </TouchableAtom>
    );
  };

  const renderFacultyFeedbackItem = ({ item, index }: any) => {
    return (
      <FacultyFeedbackCard item={item} index={index} navigation={navigation} />
    );
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={
          strings.lms.facultyManagement.facultyClassReportFeedback.main.faculty
        }
        placeholder={
          strings.lms.facultyManagement.facultyClassReportFeedback.main.faculty
        }
        data={facultyNameList}
        value={selectedFaculty?.id}
        onChange={(item: any) => setSelectedFaculty(item)}
        labelField="name"
        valueField="id"
        searchable={true}
      />

      <ViewAtom style={styles.buttonRow}>
        <TouchableAtom style={styles.applyTouchable} onPress={applyFilter}>
          <ImageBackground
            source={images.buttonGrad_50}
            style={styles.applyButton}
            imageStyle={styles.applyButtonImage}
            resizeMode="stretch"
          >
            <TextAtom style={styles.applyText}>
              {strings.lms.facultyManagement.facultyClassReportFeedback.main
                .applyFilter || 'Apply Filter'}
            </TextAtom>
          </ImageBackground>
        </TouchableAtom>
        <ButtonOrganism
          onPress={clearFilter}
          bttnText={
            strings.lms.facultyManagement.facultyClassReportFeedback.main
              .clearFilter || 'Clear Filter'
          }
          containerStyle={styles.clearBtn}
          bttnTextStyle={styles.primaryText}
        />
      </ViewAtom>
    </View>
  );

  const clearFilter = () => {
    setSelectedFaculty({});
    listFacultyFeedbackReports(1, true, search, []);
    closeFilter();
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedFaculty?.id) {
      filters.push(['facultyId', '=', selectedFaculty.id]);
    }

    listFacultyFeedbackReports(1, true, search, filters);
    closeFilter();
  };

  const getFaculty = useCallback(() => {
    setInitialCall(true);

    const params = {
      listType: 'filter_by_faculty_in_feedback',
      bipardCentre: getCentreFilter(),
      replacements: ['%%'],
    };

    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        const modifiedList = res.data.map((item: any) => ({
          ...item,
          id: item.id,
          name: `${item.id}, ${item.name}, ${item.designation || ''}`.trim(),
        }));

        setFacultyNameList(modifiedList);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
        });
      });
  }, [commonDropdownApi, getCentreFilter]);

  useFocusEffect(
    useCallback(() => {
      getFaculty();
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listFacultyFeedbackReports(1, true, '');
      }
    }, [
      firstTimeLoad,
      centerSerach,
      getFaculty,
      listFacultyFeedbackReports,
      search,
    ]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFacultyFeedbackReports(1, true, '');
  }, [centerSerach, listFacultyFeedbackReports]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View style={styles.topActionRow}>
        <TouchableAtom style={styles.filterTrigger} onPress={openFilter}>
          <TextAtom style={styles.filterTriggerText}>
            {showFilter
              ? strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .hideFilter || 'Hide Filter ▲'
              : strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .showFilter || 'Show Filter ▼'}
          </TextAtom>
        </TouchableAtom>
      </View>
      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={
            strings.lms.facultyManagement.facultyClassReportFeedback.main
              .centers
          }
          data={[
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
          ]}
          value={centerSerach?.id}
          onChange={(item: any) => setCenterSerach(item)}
          labelField="name"
          valueField="id"
          containerStyle={styles.centerDropdown}
        />
      )}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <TextAtom style={styles.headerTitle}>
            {strings.lms.facultyManagement.facultyClassReportFeedback.main.title}
          </TextAtom>
          <TextAtom style={styles.headerCount}>({totalCount})</TextAtom>
        </View>

        <View style={styles.actionsRow}>
          <TouchableAtom
            style={styles.iconBtn}
            onPress={() => setIsSearchVisible(v => !v)}
          >
            <SvgSearch width={vw(17)} height={vw(17)} />
          </TouchableAtom>
          <TouchableAtom style={styles.iconBtn} onPress={openFilter}>
            <SvgFilterLines width={vw(17)} height={vw(17)} />
          </TouchableAtom>
        </View>
      </View>

      {isSearchVisible && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={styles.searchBox}
        />
      )}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderFacultyFeedbackItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {
                strings.lms.facultyManagement.facultyClassReportFeedback.main
                  .noDataFound
              }
            </TextAtom>
          )
        }
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
              listFacultyFeedbackReports(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listFacultyFeedbackReports(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      {showFilter && (
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.overlayPressable}
            onPress={closeFilter}
          />
          <BottomSheet
            ref={filterSheetRef}
            index={0}
            snapPoints={filterSnapPoints}
            enablePanDownToClose={true}
            onAnimate={handleFilterSheetAnimate}
            handleComponent={() => <View style={styles.sheetHandle} />}
          >
            <View style={styles.sheetContainer}>
              <View style={styles.sheetHeader}>
                <TextAtom style={styles.sheetTitle}>Filters</TextAtom>
                <TouchableAtom style={styles.sheetClose} onPress={closeFilter}>
                  <SvgCross width={vw(18)} height={vw(18)} />
                </TouchableAtom>
              </View>
              <View style={styles.sheetSeparator} />
              <FilterForm />
            </View>
          </BottomSheet>
        </View>
      )}
    </SafeAreaView>
  );
};

export default FacultyClassReportFeedback;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw(8),
  },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  card: {
    backgroundColor: colors.new_ui_card_bg,
    marginHorizontal: vw(15),
    borderRadius: vw(10),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    borderWidth: vw(1),
    borderColor: colors.new_ui_card_border,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_card_title,
    marginBottom: vh(10),
  },
  threeColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(10),
  },
  infoCol: { flex: 1 },
  infoLabel: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.xs,
    color: colors.new_ui_card_description,
  },
  infoValue: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_card_title,
    marginTop: vh(4),
  },
  ratingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(6),
    marginTop: vh(4),
  },
  ratingValueText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_card_title,
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
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
  filterTrigger: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginTop: vh(10),
    marginRight: vh(15),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },
  filterTriggerText: {
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
  applyTouchable: {
    width: vw(150),
    borderRadius: vw(8),
    overflow: 'hidden',
    height: vh(35),
  },
  applyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonImage: {
    borderRadius: vw(8),
  },
  applyText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: colors.white,
  },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  starText: {
    fontSize: vw(16),
    color: colors.primary,
    marginRight: vw(2),
  },
  starContainer: { flexDirection: 'row' },
  cardHeader: { marginBottom: vh(10), flexDirection: 'row' },
  srNoLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },
  flex1: { flex: 1 },
  ratingBox: { flex: 1, alignItems: 'flex-end' },
  downloadButton: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginTop: vh(10),
    marginRight: vh(15),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },
  downloadIcon: { tintColor: colors.black },
  topActionRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    display: 'none',
  },
  centerDropdown: { marginBottom: vh(-10) },
  searchBox: { marginTop: vh(15) },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
  primaryText: { color: colors.primary },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.black_20,
    zIndex: 20,
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetHandle: {
    width: vw(44),
    height: vh(4),
    borderRadius: vw(10),
    backgroundColor: colors.grey_1,
    alignSelf: 'center',
    marginTop: vh(8),
    marginBottom: vh(10),
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: vw(20),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.lg,
    color: colors.text_black,
  },
  sheetClose: {
    width: vw(34),
    height: vw(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSeparator: {
    height: vh(1),
    backgroundColor: colors.borderGrayLight,
    marginTop: vh(10),
    marginBottom: vh(10),
  },
});
