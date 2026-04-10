import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  adminFontSizes,
  colors,
  fonts,
  screensName,
  SvgSearch,
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
import {
  useListFacultyConfirmationMutation,
  useUpdateFacultyConfirmationMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  navigation: NavigationType;
}

const FacultyConfirmation = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listFacultyDetailsApi] = useListFacultyConfirmationMutation();
  const [updateFacultyDetailsApi] = useUpdateFacultyConfirmationMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});
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

  const listFacultyConfirmations = useCallback((
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      search: keyword,
      sort: { attributes: ['id'], sorts: ['desc'] },
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
  }, [getCentreFilter, listFacultyDetailsApi]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listFacultyConfirmations(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, listFacultyConfirmations, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listFacultyConfirmations(1, true, '');
  }, [centerSerach, listFacultyConfirmations]);

  const onChangeSearch = (text: string) => {
    setSearch(text);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      listFacultyConfirmations(1, true, text);
    }, 500);
  };

  const onClearSearch = () => {
    setSearch('');
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    listFacultyConfirmations(1, true, '');
  };

  const FacultyConfirmationCard = ({ item, index: _index, navigation }: any) => {
    const [statusValue, setStatusValue] = useState(
      item.classConfirmation ?? strings.no,
    );

    const onSelectStatus = (newStatus: string) => {
      if (newStatus === statusValue) return;

      navigation.navigate(screensName.AlertOrganism, {
        title: strings.lms.facultyManagement.confirmation.statusChangeConf,
        message: strings.lms.facultyManagement.confirmation.statusChangeMsg,
        okText: strings.lms.facultyManagement.confirmation.confirm,
        double: true,
        cancelText: strings.lms.facultyManagement.confirmation.cancel,
        okFunction: () => {
          updateStatus(item.id, newStatus);
        },
        cancelFunction: () => {},
      });
    };

    const updateStatus = (id: any, status: string) => {
      setInitialCall(true);
      const params = {
        class_confirmation: status,
        id: id,
      };
      updateFacultyDetailsApi(params)
        .unwrap()
        .then((res: any) => {
          Toast.show({
            type: 'success',
            text2: res.data?.message,
          });
          setStatusValue(status);
          setInitialCall(false);
          listFacultyConfirmations(1, true, search);
        })
        .catch((err: any) => {
          setInitialCall(false);
          Toast.show({
            type: 'error',
            text2: err.data?.message || strings.something_went_wrong,
          });
        });
    };

    const displayName = item.facultyName ?? '-';
    const avatarLetter = `${displayName}`.trim().charAt(0).toUpperCase() || 'F';

    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.FacultyConfirmationDetails, {
            data: item,
          });
        }}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <TextAtom style={styles.avatarLetter}>{avatarLetter}</TextAtom>
            </View>
            <TextAtom style={styles.nameText}>{displayName}</TextAtom>
          </View>

          <View style={styles.classToggleWrap}>
            <TextAtom style={styles.classLabel}>
              {strings.lms.facultyManagement.confirmation.classConfirmation}
            </TextAtom>
            <View style={styles.classToggle}>
              <TouchableAtom
                style={[
                  styles.toggleBtn,
                  statusValue === strings.yes && styles.toggleBtnActive,
                ]}
                onPress={() => onSelectStatus(strings.yes)}
              >
                <TextAtom
                  style={[
                    styles.toggleText,
                    statusValue === strings.yes && styles.toggleTextActive,
                  ]}
                >
                  {strings.yes}
                </TextAtom>
              </TouchableAtom>
              <TouchableAtom
                style={[
                  styles.toggleBtn,
                  statusValue === strings.no && styles.toggleBtnActive,
                ]}
                onPress={() => onSelectStatus(strings.no)}
              >
                <TextAtom
                  style={[
                    styles.toggleText,
                    statusValue === strings.no && styles.toggleTextActive,
                  ]}
                >
                  {strings.no}
                </TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>

        <TextAtom style={styles.infoLabel}>
          {strings.lms.facultyManagement.confirmation.trainingName}
        </TextAtom>
        <TextAtom numberOfLines={0} style={styles.infoValue}>
          {item.trainingName ?? '-'}
        </TextAtom>

        <View style={styles.twoColRow}>
          <View style={styles.infoCol}>
            <TextAtom style={styles.infoLabel}>
              {strings.lms.facultyManagement.confirmation.subject}
            </TextAtom>
            <TextAtom numberOfLines={0} style={styles.infoValue}>
              {item.subject ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.infoCol}>
            <TextAtom style={styles.infoLabel}>
              {strings.lms.facultyManagement.confirmation.topic}
            </TextAtom>
            <TextAtom numberOfLines={0} style={styles.infoValue}>
              {item.topic ?? '-'}
            </TextAtom>
          </View>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.infoCol}>
            <TextAtom style={styles.infoLabel}>
              {strings.lms.facultyManagement.confirmation.classDate}
            </TextAtom>
            <TextAtom numberOfLines={0} style={styles.infoValue}>
              {item.classDate ?? '-'}
            </TextAtom>
          </View>
          <View style={styles.infoCol}>
            <TextAtom style={styles.infoLabel}>
              {strings.lms.facultyManagement.confirmation.sessionTime}
            </TextAtom>
            <TextAtom numberOfLines={0} style={styles.infoValue}>
              {item.sessionTime ?? '-'}
            </TextAtom>
          </View>
        </View>

        <TextAtom style={styles.viewMoreText}>View More</TextAtom>
      </TouchableAtom>
    );
  };

  const renderConfirmationItem = ({ item, index }: any) => {
    return (
      <FacultyConfirmationCard
        item={item}
        index={index}
        navigation={navigation}
      />
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.lms.locationDetails.centers}
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
          containerStyle={styles.centerDropdown}
        />
      )}

      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <TextAtom style={styles.headerTitle}>
            {strings.lms.facultyManagement.confirmation.title}
          </TextAtom>
          <TextAtom style={styles.headerCount}>({totalCount})</TextAtom>
        </View>
        <TouchableAtom
          style={styles.iconBtn}
          onPress={() => setIsSearchVisible(v => !v)}
        >
          <SvgSearch width={vw(17)} height={vw(17)} />
        </TouchableAtom>
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
        renderItem={renderConfirmationItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>
              {strings.lms.facultyManagement.confirmation.noDataFound}
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
              listFacultyConfirmations(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listFacultyConfirmations(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default FacultyConfirmation;

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
  iconBtn: {
    width: vw(22),
    height: vw(22),
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: vh(10),
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: vw(10) },
  avatarCircle: {
    width: vw(36),
    height: vw(36),
    borderRadius: vw(18),
    backgroundColor: colors.primary_sky_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  nameText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_card_title,
  },
  classToggleWrap: { alignItems: 'flex-end' },
  classLabel: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.xs,
    color: colors.new_ui_card_description,
    marginBottom: vh(4),
  },
  classToggle: {
    flexDirection: 'row',
    borderRadius: vw(8),
    overflow: 'hidden',
    borderWidth: vw(1),
    borderColor: colors.new_ui_card_border,
  },
  toggleBtn: {
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
    backgroundColor: colors.white,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary_blue,
  },
  toggleText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.xs,
    color: colors.new_ui_card_description,
  },
  toggleTextActive: {
    color: colors.white,
  },
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
  twoColRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(10),
    marginTop: vh(10),
  },
  infoCol: { flex: 1 },
  viewMoreText: {
    marginTop: vh(10),
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: '#D38B00',
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
  applyBtn: { width: vw(150), height: vh(35) },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  flex1: { flex: 1 },
  centerDropdown: { marginBottom: vh(-10) },
  searchBox: { marginTop: vh(15) },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
});
