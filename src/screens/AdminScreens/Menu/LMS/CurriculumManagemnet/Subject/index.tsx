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
  images,
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
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import {
  useListKnowledgeManagementMutation,
  useDeleteKnowledgeManagementMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { SvgDelete, SvgEditPencile } from '../../../../../../constants/svgs';

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

const Subject = (props: Props) => {
  const { navigation, route } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);

  const [listSubjectsApi] = useListKnowledgeManagementMutation();
  const [deleteSubjectApi] = useDeleteKnowledgeManagementMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const [showSearch, setShowSearch] = useState(false);

  const [activeStatus, setActiveStatus] = useState<
    'All' | 'Active' | 'Inactive'
  >('All');

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  useLayoutEffect(() => {
    if (route?.params?.suppressHeader) return;
    Header.setNavigation(
      navigation,
      strings.lms.curriculumManagement.subjectDetails,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, route?.params?.suppressHeader]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listSubjects(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listSubjects(1, true, '');
  }, [centerSerach]);

  useEffect(() => {
    if (firstTimeLoad) return;
    listSubjects(1, true, search);
  }, [activeStatus]);

  const handleDelete = (id: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this subject?',
      okText: 'Confirm',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => deleteSubject(id),
      cancelFunction: () => {},
    });
  };

  const deleteSubject = (id: any) => {
    setInitialCall(true);
    const params = { id };
    deleteSubjectApi(params)
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        listSubjects(1, true, search);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listSubjects = (
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

    listSubjectsApi(params)
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
      listSubjects(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listSubjects(1, true, '');
  };

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: strings.lms.curriculumManagement.subject,
      count: totalCount,
      search: {
        visible: true,
        onPress: () => setShowSearch(prev => !prev),
      },
      filter: { visible: false },
      create: {
        visible: true,
        onPress: () => navigation.navigate(screensName.AddSubject),
      },
    }),
    [navigation, totalCount],
  );
  const SubjectCard = ({ item, index, navigation }: any) => {
    const thumbnail =
      item?.thumbnail && item.thumbnail !== null && item.thumbnail !== ''
        ? { uri: item.thumbnail }
        : null;

    return (
      <TouchableAtom
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate(screensName.SubjectDetails, { data: item })
        }
      >
        <View style={styles.cardTopRow}>
          <TextAtom style={styles.subjectName}>{item.name ?? '-'}</TextAtom>
          <View style={styles.cardActions}>
            <TouchableAtom
              style={styles.cardIconBtn}
              onPress={() => handleDelete(item.id)}
            >
              <SvgDelete width={vw(14)} height={vw(14)} />
            </TouchableAtom>
            <TouchableAtom
              style={styles.cardIconBtn}
              onPress={() =>
                navigation.navigate(screensName.AddSubject, { item })
              }
            >
              <SvgEditPencile width={vw(14)} height={vw(14)} />
            </TouchableAtom>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.descriptionCol}>
            <TextAtom style={styles.label}>Description</TextAtom>
            <TextAtom style={styles.value}>{item.description ?? '-'}</TextAtom>
          </View>
          <View style={styles.thumbnailCol}>
            <TextAtom style={styles.label}>Thumbnail</TextAtom>
            <View style={styles.thumbnailRow}>
              {thumbnail ? (
                <ImageAtom
                  source={thumbnail}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder}>
                  <TextAtom style={styles.thumbnailPlaceholderText}>
                    {item.name?.charAt(0)?.toUpperCase() || 'S'}
                  </TextAtom>
                </View>
              )}
              <TouchableAtom style={styles.viewBtn}>
                <TextAtom style={styles.viewBtnText}>View</TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </TouchableAtom>
    );
  };

  const renderSubjectItem = ({ item, index }: any) => {
    return <SubjectCard item={item} index={index} navigation={navigation} />;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <AdminListHeader config={headerConfig} />

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
        renderItem={renderSubjectItem}
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
              listSubjects(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listSubjects(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default Subject;

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
    marginBottom: vh(12),
  },
  subjectName: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  cardActions: {
    flexDirection: 'row',
    gap: vw(8),
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
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(10),
  },
  descriptionCol: {
    flex: 1,
  },
  thumbnailCol: {
    flex: 1,
  },
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(8),
    marginTop: vh(4),
  },
  label: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.text_black,
    marginTop: vh(2),
  },
  thumbnailImage: {
    width: vw(40),
    height: vw(40),
    borderRadius: vw(4),
    backgroundColor: colors.grey,
  },
  thumbnailPlaceholder: {
    width: vw(40),
    height: vw(40),
    borderRadius: vw(4),
    backgroundColor: colors.light_sky_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailPlaceholderText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.primary_blue,
  },
  viewBtn: {
    backgroundColor: colors.primary_blue,
    paddingHorizontal: vw(12),
    paddingVertical: vh(6),
    borderRadius: vw(4),
  },
  viewBtnText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.white,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  paginationLoader: { marginTop: vh(15) },
  itemSeparator: { height: vh(10) },
  centerDropdown: { marginTop: vh(10), marginHorizontal: vw(14) },
  searchBox: { marginTop: vh(10) },
});
