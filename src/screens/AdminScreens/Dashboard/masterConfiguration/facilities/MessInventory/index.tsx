import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  adminFontSizes,
  colors,
  fonts,
  screensName,
  strings,
  SvgDelete,
  SvgEditPencile,
  vh,
  vw,
} from '../../../../../../constants';
import SubTab from '../../../../../../components/molecules/SubTab';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  useMessManagementDeleteItemBrandMutation,
  useMessManagementDeleteItemMutation,
  useMessManagementDeleteItemTypeMutation,
  useMessManagementListItemBrandMutation,
  useMessManagementListItemMutation,
  useMessManagementListItemTypeMutation,
} from '../../../../../../injectEndpoints/messManagementEndpoints';

interface Props {
  navigation: any;
}

type InventoryTab = 'brand' | 'type' | 'item';
type InventoryConfig = {
  label: string;
  title: string;
  addScreen: string;
  valueKey: string;
  listApi: any;
  deleteApi: any;
};

const ITEMS_PER_PAGE = 10;
const ListItemSeparator = () => <View style={styles.separator} />;

const field = (item: any, keys: string[], fallback = '-') => {
  for (const key of keys) {
    const nextValue = item?.[key];
    if (nextValue !== undefined && nextValue !== null && nextValue !== '') {
      return nextValue;
    }
  }
  return fallback;
};

const MessInventoryMaster = ({ navigation }: Props) => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('brand');
  const [listBrandApi] = useMessManagementListItemBrandMutation();
  const [listTypeApi] = useMessManagementListItemTypeMutation();
  const [listItemApi] = useMessManagementListItemMutation();
  const [deleteBrandApi] = useMessManagementDeleteItemBrandMutation();
  const [deleteTypeApi] = useMessManagementDeleteItemTypeMutation();
  const [deleteItemApi] = useMessManagementDeleteItemMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const tabs = useMemo(
    () => [
      { label: 'Item Brand', value: 'brand' },
      { label: 'Item Type', value: 'type' },
      { label: 'Item', value: 'item' },
    ],
    [],
  );

  const config = useMemo<Record<InventoryTab, InventoryConfig>>(
    () => ({
      brand: {
        label: 'Item Brand',
        title: 'Item Brand',
        addScreen: screensName.AddItemBrand,
        valueKey: 'name',
        listApi: listBrandApi,
        deleteApi: deleteBrandApi,
      },
      type: {
        label: 'Item Type',
        title: 'Item Type',
        addScreen: screensName.AddItemType,
        valueKey: 'itemTypeName',
        listApi: listTypeApi,
        deleteApi: deleteTypeApi,
      },
      item: {
        label: 'Item',
        title: 'Item',
        addScreen: screensName.AddItem,
        valueKey: 'itemName',
        listApi: listItemApi,
        deleteApi: deleteItemApi,
      },
    }),
    [
      deleteBrandApi,
      deleteItemApi,
      deleteTypeApi,
      listBrandApi,
      listItemApi,
      listTypeApi,
    ],
  );

  const activeConfig = config[activeTab];

  const list = useCallback(
    (pageNumber: number, initial: boolean, keyword: string) => {
      initial ? setInitialCall(true) : setInitialCall(false);

      activeConfig
        .listApi({
          search: keyword,
          sort: {
            attributes: ['id'],
            sorts: ['desc'],
          },
          filters: [],
          pageNo: pageNumber,
          itemsPerPage: ITEMS_PER_PAGE,
        })
        .unwrap()
        .then((res: any) => {
          const newData = res.data?.data ?? [];
          const nextTotalCount = res?.data?.totalCount ?? 0;

          setInitialCall(false);
          setPagination(false);
          setRefreshing(false);
          setData(prev =>
            pageNumber !== 1 && prev.length > 0
              ? [...prev, ...newData]
              : newData,
          );
          setPage(pageNumber);
          setTotalCount(nextTotalCount);
          setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < nextTotalCount);
        })
        .catch((err: any) => {
          setInitialCall(false);
          setPagination(false);
          setRefreshing(false);
          Toast.show({
            type: 'error',
            text2: err?.data?.message || strings.something_went_wrong,
          });
        });
    },
    [activeConfig],
  );

  useFocusEffect(
    useCallback(() => {
      list(1, true, search);
    }, [list, search]),
  );

  const onTabChange = (value: string) => {
    setActiveTab(value as InventoryTab);
    setData([]);
    setPage(1);
    setTotalCount(0);
    setSearch('');
    setShowSearch(false);
  };

  const deleteData = useCallback(
    (item: any) => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.hostelManagement.deleteConfirmation,
        message: strings.hostelManagement.deleteItemConfirmation,
        okText: strings.hostelManagement.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          setInitialCall(true);
          activeConfig
            .deleteApi({ id: item.id })
            .unwrap()
            .then((res: any) => {
              Toast.show({
                type: 'success',
                text2: res?.data?.message || `${activeConfig.label} deleted`,
              });
              list(1, true, search);
            })
            .catch((err: any) => {
              setInitialCall(false);
              Toast.show({
                type: 'error',
                text2: err?.data?.message || strings.something_went_wrong,
              });
            });
        },
        cancelFunction: () => {},
      });
    },
    [activeConfig, list, navigation, search],
  );

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: activeConfig.title,
      count: totalCount,
      search: {
        visible: true,
        onPress: () => setShowSearch(prev => !prev),
      },
      filter: {
        visible: true,
        onPress: () => {},
      },
      create: {
        visible: true,
        onPress: () =>
          navigation.navigate(activeConfig.addScreen, {
            fromFacilities: true,
            onDone: () => list(1, true, search),
          }),
      },
    }),
    [activeConfig, list, navigation, search, totalCount],
  );

  const renderItemCard = ({ item }: any) => {
    if (activeTab === 'item') {
      return (
        <View style={[styles.card, styles.itemCard]}>
          <View style={styles.cardHeader}>
            <TextAtom numberOfLines={1} style={styles.cardTitle}>
              {field(item, ['itemName'], 'Item Name')}
            </TextAtom>
            <View style={styles.actionRow}>
              <TouchableAtom
                style={styles.actionButton}
                onPress={() => deleteData(item)}
              >
                <SvgDelete />
              </TouchableAtom>
              <TouchableAtom
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate(activeConfig.addScreen, {
                    item,
                    fromFacilities: true,
                    onDone: () => list(1, true, search),
                  })
                }
              >
                <SvgEditPencile />
              </TouchableAtom>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <TextAtom style={styles.infoLabel}>Brand Name</TextAtom>
              <TextAtom numberOfLines={1} style={styles.infoValue}>
                {field(item, ['itemBrandName'])}
              </TextAtom>
            </View>
            <View style={styles.infoItem}>
              <TextAtom style={styles.infoLabel}>Type Name</TextAtom>
              <TextAtom numberOfLines={1} style={styles.infoValue}>
                {field(item, ['itemTypeName'])}
              </TextAtom>
            </View>
            <View style={styles.infoItem}>
              <TextAtom style={styles.infoLabel}>Unit</TextAtom>
              <TextAtom numberOfLines={1} style={styles.infoValue}>
                {field(item, ['measurementUnitName'])}
              </TextAtom>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <TextAtom numberOfLines={1} style={styles.simpleTitle}>
          {field(item, [activeConfig.valueKey])}
        </TextAtom>
        <View style={styles.actionRow}>
          <TouchableAtom
            style={styles.actionButton}
            onPress={() => deleteData(item)}
          >
            <SvgDelete />
          </TouchableAtom>
          <TouchableAtom
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(activeConfig.addScreen, {
                item,
                fromFacilities: true,
                onDone: () => list(1, true, search),
              })
            }
          >
            <SvgEditPencile />
          </TouchableAtom>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <SubTab tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <View style={styles.content}>
        <AdminListHeader config={headerConfig} />
        {showSearch && (
          <SearchBoxOrganism
            onChangeText={(text: string) => {
              setSearch(text);
              list(1, true, text);
            }}
            searchText={search}
            onPressCross={() => {
              setSearch('');
              list(1, true, '');
            }}
            searchBox={styles.searchBox}
          />
        )}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={renderItemCard}
          keyExtractor={(item, index) => (item?.id ?? index).toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ListItemSeparator}
          ListEmptyComponent={
            initialCall ? null : (
              <TextAtom style={styles.emptyText}>
                {strings.hostelManagement.noDataFound}
              </TextAtom>
            )
          }
          ListFooterComponent={
            <ActivityIndicator
              size="small"
              color={colors.primary}
              animating={pagination}
              style={styles.footerLoader}
            />
          }
          refreshControl={
            <RefreshControl
              tintColor={colors.primary}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                list(1, false, search);
              }}
            />
          }
          onEndReached={() => {
            if (!nextPageAvailable || pagination || initialCall) return;
            setPagination(true);
            list(page + 1, false, search);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default MessInventoryMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: vw(16),
  },
  searchBox: {
    marginTop: vh(10),
    marginBottom: vh(4),
  },
  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(24),
  },
  card: {
    minHeight: vh(60),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCard: {
    minHeight: vh(165),
    alignItems: 'stretch',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  simpleTitle: {
    flex: 1,
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.text_black,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: vw(4),
  },
  infoGrid: {
    marginTop: vh(22),
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: vh(8),
  },
  infoItem: {
    width: '50%',
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
    color: colors.new_ui_card_description,
    marginBottom: vh(5),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.text_black,
  },
  separator: {
    height: vh(10),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  footerLoader: {
    marginTop: vh(15),
  },
});
