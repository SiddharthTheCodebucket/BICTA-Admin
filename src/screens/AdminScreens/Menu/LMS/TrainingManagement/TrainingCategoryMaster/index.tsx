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
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { useListTrainingCategoryMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

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

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Training Management');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const getCentreFilter = useCallback(() => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === 'All Centers') {
      return ['Gaya', 'Patna'];
    }
    return [centerSerach.name];
  }, [centerSerach]);

  const listTrainingCategoryDetails = useCallback((
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
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
  }, [data.length, getCentreFilter, listTrainingApi]);

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
    }, [firstTimeLoad, centerSerach?.name, search, listTrainingCategoryDetails]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listTrainingCategoryDetails(1, true, '');
  }, [centerSerach?.name, listTrainingCategoryDetails]);

  const openCenterFilter = () => {
    if (crediantialData?.user?.[0]?.tenantId !== 3) return;

    navigation.navigate('DropDownModal', {
      name: 'Center',
      Data: [
        { id: 'All Centers', name: 'All Centers' },
        { id: 'Gaya', name: 'Gaya' },
        { id: 'Patna', name: 'Patna' },
      ],
      selectedData: centerSerach,
      setSelectedData: (selectedData: any) => {
        setCenterSerach(selectedData);
      },
      typeName: 'name',
      typeId: 'id',
    });
  };

  const renderTrainingCard = useCallback(
    ({ item }: any) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={1} style={styles.title}>
            {item.categoryName ?? '-'}
          </TextAtom>

          <TouchableAtom
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate(screensName.AddTrainingCategory, {
                item,
                onDone: () => listTrainingCategoryDetails(1, true, search),
              })
            }
          >
            <ImageAtom source={images.edit_pencil} style={styles.editIcon} />
          </TouchableAtom>
        </View>

        <TextAtom numberOfLines={3} style={styles.description}>
          {item.description ?? '-'}
        </TextAtom>
      </View>
    ),
    [navigation, search, listTrainingCategoryDetails],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <View style={styles.tabRow}>
        <TouchableAtom style={[styles.tabItem, styles.tabItemActive]}>
          <TextAtom style={[styles.tabText, styles.tabTextActive]}>
            Training Category
          </TextAtom>
        </TouchableAtom>

        <TouchableAtom
          style={styles.tabItem}
          onPress={() => navigation.navigate(screensName.TrainingDetails)}
        >
          <TextAtom style={styles.tabText}>Training Details</TextAtom>
        </TouchableAtom>

        <TouchableAtom
          style={styles.tabItem}
          onPress={() => navigation.navigate(screensName.BatchDetails)}
        >
          <TextAtom style={styles.tabText}>Batch Details</TextAtom>
        </TouchableAtom>
      </View>

      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <TextAtom style={styles.headerTitle}>Training Category</TextAtom>
          <TextAtom style={styles.headerCount}>({totalCount})</TextAtom>
        </View>

        <View style={styles.actionsRow}>
          <TouchableAtom
            style={styles.iconBtn}
            onPress={() => setShowSearch(prev => !prev)}
          >
            <ImageAtom source={images.search} style={styles.actionIcon} />
          </TouchableAtom>

          <TouchableAtom style={styles.iconBtn} onPress={openCenterFilter}>
            <View style={styles.filterGlyph}>
              <View style={[styles.filterLine, { width: vw(12) }]} />
              <View style={[styles.filterLine, { width: vw(9) }]} />
              <View style={[styles.filterLine, { width: vw(6) }]} />
            </View>
          </TouchableAtom>

          <TouchableAtom
            style={styles.createButton}
            onPress={() => {
              navigation.navigate(screensName.AddTrainingCategory, {
                onDone: () => listTrainingCategoryDetails(1, true, search),
              });
            }}
          >
            <TextAtom style={styles.createButtonText}>+ Create</TextAtom>
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
    </SafeAreaView>
  );
};

export default TrainingCategoryMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },

  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(14),
    paddingTop: vh(10),
    paddingBottom: vh(8),
    backgroundColor: colors.white,
  },

  tabItem: {
    borderRadius: vw(4),
    paddingHorizontal: vw(10),
    paddingVertical: vh(8),
    marginRight: vw(8),
  },

  tabItemActive: {
    backgroundColor: colors.primary_sky_blue,
  },

  tabText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.new_ui_tab_text,
  },

  tabTextActive: {
    color: colors.new_ui_tab_text_active,
  },

  headerRow: {
    marginTop: vh(8),
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
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },

  headerCount: {
    marginLeft: vw(4),
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
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

  createButton: {
    backgroundColor: colors.primary_dark_blue,
    borderRadius: vw(8),
    paddingHorizontal: vw(14),
    paddingVertical: vh(9),
  },

  createButtonText: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(13),
    color: colors.white,
  },

  searchBox: {
    marginTop: vh(10),
  },

  flatListContainer: {
    paddingTop: vh(12),
    paddingBottom: vh(20),
  },

  card: {
    backgroundColor: colors.new_ui_card_bg,
    marginHorizontal: vw(14),
    borderRadius: vw(12),
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(8),
  },

  title: {
    flex: 1,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    color: colors.new_ui_card_title,
    marginRight: vw(8),
  },

  description: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.new_ui_card_description,
    lineHeight: vh(22),
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },

  editBtn: {
    borderWidth: 1,
    borderColor: colors.new_ui_edit_border,
    borderRadius: vw(8),
    width: vw(28),
    height: vw(28),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  editIcon: {
    tintColor: colors.new_ui_edit_icon,
    width: vw(14),
    height: vw(14),
  },
});
