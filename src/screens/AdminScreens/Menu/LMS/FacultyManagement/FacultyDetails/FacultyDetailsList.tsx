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
  SvgDelete,
  SvgEditPencile,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';

import {
  useDeleteFacultyDetailsMutation,
  useListFacultyDetailsMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { useFacultyCenter } from '../../../../Dashboard/academics/Faculty/context/FacultyCenterContext';
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import {
  FormGradientButton,
  FormWhiteButton,
} from '../../../../../../components/templates';

interface Props {
  route: any;
  navigation: NavigationType;
}

const FacultyDetailsList = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listFacultyDetailsApi] = useListFacultyDetailsMutation();
  const [deletebedDetailsRoomApi] = useDeleteFacultyDetailsMutation();

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

  const [facultyTypeList, setFacultyTypeList] = useState<any>([]);
  const [departmentList, setDepartmentList] = useState<any>([]);
  const [organisationList, setOrganisationList] = useState<any>([]);
  const [selectedFacultyType, setSelectedFacultyType] = useState<any>({});
  const [selectedDepartment, setSelectedDepartment] = useState<any>({});
  const [selectedOrganisation, setSelectedOrganisation] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const { center: centerSerach, setCenter: setCenterSerach } =
    useFacultyCenter();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    // Header handled by FacultyManagement tabbed screen
  });

  const getCentreFilter = useCallback(() => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  }, [centerSerach]);

  const openFilter = useCallback(() => setShowFilter(true), []);
  const closeFilter = useCallback(() => setShowFilter(false), []);

  const fetchFacultyDetails = useCallback(
    (
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
      };
      if (centreFilter) {
        params.bipardCentre = centreFilter;
      }

      listFacultyDetailsApi(params)
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
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    },
    [getCentreFilter, listFacultyDetailsApi],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchFacultyDetails(1, true, text);
    }, 500);
  };

  const onClearSearch = () => {
    setSearch('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    fetchFacultyDetails(1, true, '');
  };

  const FacultyDetailCard = ({ item, index: _index, navigation }: any) => {
    const handleDelete = () => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.lms.facultyManagement.details.deleteConf,
        message: strings.lms.facultyManagement.details.deleteMsg,
        okText: strings.lms.facultyManagement.details.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          deleteFacultyRecord(item.facultyId);
        },
        cancelFunction: () => {},
      });
    };

    const deleteFacultyRecord = (id: any) => {
      setInitialCall(true);
      const params = {
        faculty_id: id,
      };
      deletebedDetailsRoomApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data.message,
          });
          setInitialCall(false);
          fetchFacultyDetails(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    };

    const handleEdit = () => {
      navigation.navigate(screensName.AddFacultyDetails, { item });
    };

    const displayName = item.facultyName ?? '-';
    const avatarLetter = `${displayName}`.trim().charAt(0).toUpperCase() || 'F';

    return (
      <TouchableAtom
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate(screensName.FacultyDetailDetails, { data: item })
        }
      >
        <View style={styles.cardTopRow}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <TextAtom style={styles.avatarLetter}>{avatarLetter}</TextAtom>
            </View>
            <View style={styles.nameBlock}>
              <TextAtom style={styles.nameText}>{displayName}</TextAtom>
              <View style={styles.badge}>
                <TextAtom style={styles.badgeText}>
                  {strings.lms.facultyManagement.details.facultyId} -{' '}
                  {item.facultyId ?? '-'}
                </TextAtom>
              </View>
            </View>
          </View>

          <View style={styles.iconActions}>
            <TouchableAtom style={styles.cardIconBtn} onPress={handleDelete}>
              <SvgDelete width={vw(30)} height={vw(30)} />
            </TouchableAtom>
            <TouchableAtom
              style={[styles.cardIconBtn, { marginLeft: 10 }]}
              onPress={handleEdit}
            >
              <SvgEditPencile width={vw(30)} height={vw(30)} />
            </TouchableAtom>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <TextAtom style={styles.infoLabel}>
                {strings.lms.facultyManagement.details.facultyUID}
              </TextAtom>
              <TextAtom style={styles.infoValue}>
                {item.facultyUniqueId ?? '-'}
              </TextAtom>
            </View>
            <View style={styles.infoCol}>
              <TextAtom style={styles.infoLabel}>
                {strings.lms.facultyManagement.details.facultyType}
              </TextAtom>
              <TextAtom style={styles.infoValue}>
                {item.facultyType ?? '-'}
              </TextAtom>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <TextAtom style={styles.infoLabel}>
                {strings.lms.facultyManagement.details.designation}
              </TextAtom>
              <TextAtom style={styles.infoValue}>
                {item.designation ?? '-'}
              </TextAtom>
            </View>
            <View style={styles.infoCol}>
              <TextAtom style={styles.infoLabel}>
                {strings.lms.facultyManagement.details.department}
              </TextAtom>
              <TextAtom style={styles.infoValue}>
                {item.department ?? '-'}
              </TextAtom>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <TextAtom style={styles.infoLabel}>
                {strings.lms.facultyManagement.details.facultyOrganisation}
              </TextAtom>
              <TextAtom style={styles.infoValue}>
                {item.facultyOrganisation ?? '-'}
              </TextAtom>
            </View>
            <View style={styles.infoCol}>
              <TextAtom style={styles.infoLabel}>
                {strings.lms.facultyManagement.details.mobileNumber}
              </TextAtom>
              <TextAtom style={styles.infoValue}>
                {item.mobileNo ?? '-'}
              </TextAtom>
            </View>
          </View>
        </View>

        <TouchableAtom
          onPress={() =>
            navigation.navigate(screensName.FacultyDetailDetails, {
              data: item,
            })
          }
          style={styles.viewMoreRow}
        >
          <TextAtom style={styles.viewMoreText}>View More</TextAtom>
        </TouchableAtom>
      </TouchableAtom>
    );
  };

  const renderFacultyItem = ({ item, index }: any) => {
    return (
      <FacultyDetailCard item={item} index={index} navigation={navigation} />
    );
  };

  const FilterForm = () => (
    <View style={styles.filterContainer}>
      <DropDownOrganism
        label={strings.lms.facultyManagement.details.facultyType}
        placeholder={strings.lms.facultyManagement.details.facultyType}
        data={facultyTypeList}
        value={selectedFacultyType?.id}
        onChange={(item: any) => setSelectedFacultyType(item)}
        labelField="name"
        valueField="id"
        searchable={true}
        labelStyle={{ fontFamily: fonts.Inter_Regular, color: '#384048' }}
      />

      <DropDownOrganism
        label={strings.lms.facultyManagement.details.department}
        placeholder={strings.lms.facultyManagement.details.department}
        data={departmentList}
        value={selectedDepartment?.id}
        onChange={(item: any) => setSelectedDepartment(item)}
        labelField="name"
        valueField="id"
        searchable={true}
        labelStyle={{ fontFamily: fonts.Inter_Regular, color: '#384048' }}
      />

      <DropDownOrganism
        label={strings.lms.facultyManagement.details.facultyOrganisation}
        placeholder={strings.lms.facultyManagement.details.facultyOrganisation}
        data={organisationList}
        value={selectedOrganisation?.id}
        onChange={(item: any) => setSelectedOrganisation(item)}
        labelField="name"
        valueField="id"
        searchable={true}
        labelStyle={{ fontFamily: fonts.Inter_Regular, color: '#384048' }}
      />

      <ViewAtom style={styles.buttonRow}>
        <View style={{ marginRight: vw(4), flex: 1 }}>
          <FormWhiteButton
            onPress={clearFilter}
            title={strings.lms.facultyManagement.details.clearFilter}
            buttonStyle={{ height: vh(40) }}
          />
        </View>
        <View style={{ marginLeft: vw(4), flex: 1 }}>
          <FormGradientButton
            onPress={applyFilter}
            title={strings.lms.facultyManagement.details.applyFilter}
            buttonStyle={{ height: vh(40) }}
          />
        </View>
      </ViewAtom>
    </View>
  );

  const clearFilter = () => {
    setSelectedFacultyType({});
    setSelectedDepartment({});
    setSelectedOrganisation({});
    fetchFacultyDetails(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedFacultyType?.id) {
      filters.push(['facultyType', '=', selectedFacultyType.id]);
    }

    if (selectedDepartment?.id) {
      filters.push(['department', '=', selectedDepartment.id]);
    }

    if (selectedOrganisation?.id) {
      filters.push(['facultyOrganisation', '=', selectedOrganisation.id]);
    }

    fetchFacultyDetails(1, true, search, filters);
    closeFilter();
  };

  const getFacultyType = useCallback(() => {
    setInitialCall(true);
    const params = {
      listType: 'faculty_category',
      bipardCentre: [],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setFacultyTypeList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
          autoHide: true,
        });
      });
  }, [commonDropdownApi]);

  const getDepartment = useCallback(() => {
    setInitialCall(true);
    const params = {
      listType: 'filter_by_faculty_department',
      bipardCentre: [strings.dashboardIndex.gaya, strings.dashboardIndex.patna],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setDepartmentList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  }, [commonDropdownApi]);

  const getOrganization = useCallback(() => {
    setInitialCall(true);
    const params = {
      listType: 'filter_by_faculty_organisation',
      bipardCentre: [strings.dashboardIndex.gaya, strings.dashboardIndex.patna],
      replacements: ['%%'],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setOrganisationList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  }, [commonDropdownApi]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        fetchFacultyDetails(1, true, '');
        getFacultyType();
        getDepartment();
        getOrganization();
      }
    }, [
      firstTimeLoad,
      centerSerach,
      fetchFacultyDetails,
      getFacultyType,
      getDepartment,
      getOrganization,
      search,
    ]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    fetchFacultyDetails(1, true, '');
  }, [centerSerach, fetchFacultyDetails]);

  const headerConfig: AdminListHeaderConfig = useMemo(
    () => ({
      title:
        strings.lms.facultyManagement.facultyClassReportFeedback.main.faculty,
      count: totalCount,
      search: {
        visible: true,
        onPress: () => setIsSearchVisible(v => !v),
      },
      filter: {
        visible: true,
        onPress: openFilter,
      },
      create: {
        visible: true,
        onPress: () => navigation.navigate(screensName.AddFacultyDetails),
      },
    }),
    [navigation, openFilter, totalCount],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader config={headerConfig} />
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
        renderItem={renderFacultyItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>
              {strings.lms.facultyManagement.details.noDataFound}
            </TextAtom>
          ) : null
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
              fetchFacultyDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? fetchFacultyDetails(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      <AdminBottomModal visible={showFilter} onClose={closeFilter}>
        <FilterForm />
      </AdminBottomModal>
    </SafeAreaView>
  );
};

export default FacultyDetailsList;

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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
  },
  iconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
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
  createButtonImage: {
    borderRadius: vw(8),
  },
  createButtonText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: colors.white,
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
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(6),
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: vw(10) },
  avatarCircle: {
    width: vw(36),
    height: vw(36),
    borderRadius: vw(18),
    backgroundColor: colors.light_sky_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  nameBlock: { flexShrink: 1 },
  nameText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_card_title,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: vh(4),
    paddingHorizontal: vw(8),
    paddingVertical: vh(2),
    borderRadius: vw(6),
    backgroundColor: colors.light_sky_blue,
  },
  badgeText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.xs,
    color: colors.new_ui_card_description,
  },
  iconActions: { flexDirection: 'row', alignItems: 'center', gap: vw(8) },
  iconButton: {
    width: vw(34),
    height: vw(34),
    borderRadius: vw(8),
    borderWidth: vw(1),
    borderColor: colors.new_ui_edit_border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  infoGrid: { marginTop: vh(6) },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(10),
    marginTop: vh(10),
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
    marginTop: vh(3),
  },
  viewMoreRow: { marginTop: vh(12) },
  viewMoreText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: '#D38B00',
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
  statusSection: { marginTop: vh(0), zIndex: 999 },
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
  blackText: { color: colors.black },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.transparent,
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
  flex1: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: vw(15) },
  deleteButton: {
    borderWidth: vw(1),
    borderColor: colors.red_2,
    borderRadius: vw(6),
    padding: vw(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon15: { width: vw(15), height: vw(15) },
  labelValueAlignEnd: { flex: 1, alignItems: 'flex-end' },
  primaryText: { color: colors.primary },
  centerDropdown: { marginBottom: vh(-10) },
  searchBox: { marginTop: vh(15) },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
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
