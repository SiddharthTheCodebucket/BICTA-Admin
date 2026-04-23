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
  colors,
  fonts,
  screensName,
  SvgEditPencile,
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
import { useListTrainingCategoryMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import DropDownModal from '../../../../../../modal/DropDownModal';

interface Props {
  navigation: NavigationType;
}

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const TrainingCategoryMaster = (props: Props) => {
  const { navigation } = props;

  const { crediantialData } = useAppSelector(state => state.Auth);
  const [listTrainingApi] = useListTrainingCategoryMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');
  const [centerSerach, setCenterSerach] = React.useState<any>({});

  const [isCenterModalVisible, setIsCenterModalVisible] = useState(false);
  const [centerSearch, setCenterSearch] = useState<any>(null);

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
  });

  const getCentreFilter = useCallback(() => {
    if (!centerSearch?.name) return null;

    if (centerSearch.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }

    return [centerSearch.name];
  }, [centerSearch]);

  const listTrainingCategoryDetails = useCallback(
    (pageNumber: number, initial: boolean, keyword: string) => {
      initial ? setInitialCall(true) : setInitialCall(false);

      const centreFilter = getCentreFilter();

      const params: any = {
        search: keyword,
        sort: {
          attributes: ['createdDate'],
          sorts: ['desc'],
        },
        filters: [],
        pageNo: pageNumber,
        itemsPerPage: ITEMS_PER_PAGE,
        bipardCentre: centreFilter ?? [],
      };

      listTrainingApi(params)
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

          const tCount = res?.data?.totalCount ?? 0;
          setTotalCount(tCount);

          setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < tCount);
          setPage(pageNumber);
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
    },
    [data.length, getCentreFilter, listTrainingApi],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    listTrainingCategoryDetails(1, true, text);
  };

  const onClearSearch = () => {
    setSearch('');
    listTrainingCategoryDetails(1, true, '');
  };

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTrainingCategoryDetails(1, true, '');
      }
    }, [
      firstTimeLoad,
      centerSerach?.name,
      search,
      listTrainingCategoryDetails,
    ]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTrainingCategoryDetails(1, true, '');
  }, [centerSerach?.name, listTrainingCategoryDetails]);

  const openCenterFilter = useCallback(() => {
    if (crediantialData?.user?.[0]?.tenantId !== 3) return;
    setIsCenterModalVisible(true);
  }, [crediantialData]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listTrainingCategoryDetails(1, true, '');
      }
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTrainingCategoryDetails(1, true, '');
  }, [centerSerach]);

  const renderTrainingCard = useCallback(
    ({ item }: any) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={1} style={styles.title}>
            {item.categoryName ?? '-'}
          </TextAtom>

          <TouchableAtom
            style={{}}
            onPress={() =>
              navigation.navigate(screensName.AddTrainingCategoryMaster, {
                item,
                onDone: () => listTrainingCategoryDetails(1, true, search),
              })
            }
          >
            <SvgEditPencile />
          </TouchableAtom>
        </View>

        <TextAtom numberOfLines={3} style={styles.description}>
          {item.description ?? '-'}
        </TextAtom>
      </View>
    ),
    [navigation, search, listTrainingCategoryDetails],
  );

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: 'Training Category',
      count: totalCount,
      search: {
        visible: true,
        onPress: () => setShowSearch(prev => !prev),
      },
      filter: {
        visible: true,
        onPress: openCenterFilter,
      },
       create: {
         visible: true,
         onPress: () => {
           navigation.navigate(screensName.AddTrainingCategoryMaster, {
             onDone: () => listTrainingCategoryDetails(1, true, search),
           });
         },
       },

    }),
    [navigation, openCenterFilter, search, totalCount, listTrainingCategoryDetails],
  );

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

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTrainingCard}
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
            style={{ marginTop: vh(15) }}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listTrainingCategoryDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          if (!nextPageAvailable || pagination || initialCall) return;
          setPagination(true);
          listTrainingCategoryDetails(page + 1, false, search);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />

      <DropDownModal
        isVisible={isCenterModalVisible}
        onClose={() => setIsCenterModalVisible(false)}
        name="Center"
        data={[
          { id: 'All Centers', name: 'All Centers' },
          { id: 'Gaya', name: 'Gaya' },
          { id: 'Patna', name: 'Patna' },
        ]}
        selectedData={centerSearch}
        setSelectedData={(selectedData: any) => {
          setCenterSearch(selectedData);
          setIsCenterModalVisible(false);
          listTrainingCategoryDetails(1, true, search);
        }}
        typeName="name"
        typeId="id"
      />
    </SafeAreaView>
  );
};

export default TrainingCategoryMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },

  headerRow: {
    marginTop: vh(10),

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
    fontSize: vw(32 / 2),
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
    height: vh(44),
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

  searchBox: {
    marginTop: vh(10),
  },

  flatListContainer: {
    paddingTop: vh(10),
    paddingBottom: vh(20),
  },

  card: {
    backgroundColor: colors.white,

    borderRadius: vw(10),
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },

  title: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_card_title,
    lineHeight: vh(19),
    marginRight: vw(8),
  },

  description: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_card_description,
    lineHeight: vh(19),
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
});
