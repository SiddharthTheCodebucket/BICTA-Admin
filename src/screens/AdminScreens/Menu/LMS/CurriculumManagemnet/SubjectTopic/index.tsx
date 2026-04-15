import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
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
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import SubTab from '../../../../../../components/molecules/SubTab';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';

import { useCommonDropdownListMutation } from '../../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import { useListKnowledgeManagementSubTopicMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import { SvgEditPencile } from '../../../../../../constants/svgs';

interface Props {
  navigation: NavigationType;
  route?: any;
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

const SubjectTopic = (props: Props) => {
  const { navigation, route } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [commonDropdownApi] = useCommonDropdownListMutation();
  const [listSubjectTopicsApi] = useListKnowledgeManagementSubTopicMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeStatus, setActiveStatus] = useState<'Active' | 'Inactive'>(
    'Active',
  );

  const [userTypesList, setUserTypesList] = useState<any[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    if (route?.params?.suppressHeader) return;
    Header.setNavigation(
      navigation,
      strings.lms.curriculumManagement.subjectTopicDetails,
      undefined,
      undefined,
      undefined,
      undefined,
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, route?.params?.suppressHeader]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listSubjectTopics(1, true, '');
        getUserTypes();
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listSubjectTopics(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    if (firstTimeLoad) return;
    listSubjectTopics(1, true, search);
  }, [activeStatus]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const clearFilter = () => {
    setSelectedUserType({});
    listSubjectTopics(1, true, search, []);
  };

  const applyFilter = () => {
    const filters = [];

    if (selectedUserType?.id) {
      filters.push(['userTypeId', '=', selectedUserType.id]);
    }
    listSubjectTopics(1, true, search, filters);
  };

  const listSubjectTopics = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();

    const statusFilters: any[] = [];
    if (activeStatus === 'Active') {
      statusFilters.push(['status', '=', 'Active']);
    } else if (activeStatus === 'Inactive') {
      statusFilters.push(['status', '=', 'Inactive']);
    }

    const combinedFilters = [...statusFilters, ...filtersArray];

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: combinedFilters,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listSubjectTopicsApi(params)
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
        setTotalCount(totalCount);
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
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
      listSubjectTopics(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listSubjectTopics(1, true, '');
  };

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: strings.lms.curriculumManagement.subjectTopicDetails,
      count: totalCount,
      search: {
        visible: true,
        onPress: () => setShowSearch(prev => !prev),
      },
      filter: { visible: false },
      create: {
        visible: true,
        onPress: () => navigation.navigate(screensName.AddSubjectTopic),
      },
    }),
    [navigation, totalCount],
  );
  const SubjectTopicCard = ({ item, index, navigation }: any) => {
    const isActive = item?.status === 'Active';

    return (
      <TouchableAtom
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate(screensName.AddSubjectTopic, { item })
        }
      >
        <View style={styles.cardTopRow}>
          <View style={styles.cardInfo}>
            <TextAtom numberOfLines={1} style={styles.cardSubjectPrefix}>
              #{item.subject ?? '-'}
            </TextAtom>
            <TextAtom numberOfLines={2} style={styles.cardDescription}>
              {item.description ?? '-'}
            </TextAtom>
          </View>

          <TouchableAtom
            style={styles.cardIconBtn}
            onPress={() =>
              navigation.navigate(screensName.AddSubjectTopic, { item })
            }
          >
            <SvgEditPencile width={vw(14)} height={vw(14)} />
          </TouchableAtom>
        </View>

        <View style={styles.cardStatusRow}>
          <View
            style={[
              styles.statusPill,
              isActive ? styles.statusPillActive : styles.statusPillInactive,
            ]}
          >
            <TextAtom
              style={[
                styles.statusPillText,
                isActive
                  ? styles.statusPillTextActive
                  : styles.statusPillTextInactive,
              ]}
            >
              {isActive ? 'Active' : 'Inactive'}
            </TextAtom>
          </View>
        </View>
      </TouchableAtom>
    );
  };

  const renderSubjectTopicItem = ({ item, index }: any) => {
    return (
      <SubjectTopicCard item={item} index={index} navigation={navigation} />
    );
  };

  const getUserTypes = () => {
    setInitialCall(true);
    const params = {
      listType: 'select_user_type',
      bipardCentre: getCentreFilter(),
      replacements: [],
    };
    commonDropdownApi(params)
      .unwrap()
      .then((res: any) => {
        setUserTypesList(res.data);
        setInitialCall(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View style={{ paddingHorizontal: vw(16) }}>
        <AdminListHeader config={headerConfig} />
      </View>

      <SubTab
        tabs={[
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
        ]}
        activeTab={activeStatus}
        onTabChange={value => setActiveStatus(value as 'Active' | 'Inactive')}
      />

      {showSearch && (
        <SearchBoxOrganism
          onChangeText={onChangeSearch}
          searchText={search}
          onPressCross={onClearSearch}
          searchBox={styles.searchBox}
        />
      )}

      {crediantialData.user[0].tenantId === 3 && (
        <DropDownOrganism
          label={''}
          placeholder={strings.lms.locationDetails.centers}
          onPress={() => {
            navigation.navigate('DropDownModal', {
              name: 'Center',
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

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderSubjectTopicItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.curriculumManagement.noDataFound}
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
              listSubjectTopics(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listSubjectTopics(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      {showFilter && (
        <View style={styles.sheetOverlay}>
          <TouchableAtom
            style={styles.overlayPressable}
            onPress={() => setShowFilter(false)}
          >
            <View style={{ flex: 1 }} />
          </TouchableAtom>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <TextAtom style={styles.sheetTitle}>Filters</TextAtom>
              <TouchableAtom
                style={styles.sheetClose}
                onPress={() => setShowFilter(false)}
              >
                <TextAtom style={styles.closeText}>X</TextAtom>
              </TouchableAtom>
            </View>
            <View style={styles.sheetSeparator} />
            <View style={styles.filterContent}>
              <TextAtom style={styles.filterLabel}>User Type</TextAtom>
              <DropDownOrganism
                label={''}
                placeholder="Select"
                onPress={() => {
                  navigation.navigate('DropDownModal', {
                    name: strings.lms.curriculumManagement.userType,
                    Data: userTypesList,
                    selectedData: selectedUserType,
                    setSelectedData: (data: any) => {
                      setSelectedUserType(data);
                    },
                    typeName: 'name',
                    typeId: 'id',
                  });
                }}
                inputText={selectedUserType?.name}
              />
              <View style={styles.filterButtonRow}>
                <TouchableAtom style={styles.clearBtn} onPress={clearFilter}>
                  <TextAtom style={styles.clearBtnText}>Clear</TextAtom>
                </TouchableAtom>
                <TouchableAtom style={styles.applyBtn} onPress={applyFilter}>
                  <TextAtom style={styles.applyBtnText}>Apply</TextAtom>
                </TouchableAtom>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default SubjectTopic;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(14),
    borderRadius: vw(12),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  cardSubjectPrefix: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.primary_blue,
  },
  cardDescription: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.grey,
    marginTop: vh(2),
  },
  cardIconBtn: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(6),
    borderWidth: 1,
    borderColor: colors.grey_1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
  centerDropdown: { marginTop: vh(10), marginHorizontal: vw(14) },
  searchBox: { marginTop: vh(10) },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  overlayPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: vw(20),
    borderTopRightRadius: vw(20),
    padding: vw(20),
    paddingBottom: vh(40),
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vh(16),
  },
  sheetTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: adminFontSizes.lg,
    color: colors.text_black,
  },
  sheetClose: {
    padding: vw(4),
  },
  closeText: {
    fontSize: vw(18),
    color: colors.text_black,
    fontWeight: 'bold',
  },
  sheetSeparator: {
    height: 1,
    backgroundColor: colors.grey_1,
    marginBottom: vh(16),
  },
  filterContent: {
    gap: vh(16),
  },
  filterLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.text_black,
    marginBottom: vh(8),
  },
  filterButtonRow: {
    flexDirection: 'row',
    gap: vw(10),
    marginTop: vh(20),
  },
  clearBtn: {
    flex: 1,
    height: vh(46),
    borderRadius: vw(10),
    borderWidth: 1,
    borderColor: colors.grey_1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  applyBtn: {
    flex: 1,
    height: vh(46),
    borderRadius: vw(10),
    backgroundColor: colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.md,
    color: colors.white,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  cardStatusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: vh(8),
  },
  statusPill: {
    paddingHorizontal: vw(8),
    paddingVertical: vh(4),
    borderRadius: vw(12),
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: '#E6FFFA',
    borderColor: colors.green,
  },
  statusPillInactive: {
    backgroundColor: '#FFF5F5',
    borderColor: colors.red,
  },
  statusPillText: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Medium,
  },
  statusPillTextActive: {
    color: colors.green,
  },
  statusPillTextInactive: {
    color: colors.red,
  },
});
