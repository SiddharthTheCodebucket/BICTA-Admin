import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  screensName,
  strings,
  SvgDelete,
  SvgEditPencile,
  vh,
  vw,
} from '../../../../../../constants';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  useMessManagementDeleteMessMutation,
  useMessManagementListMessMutation,
} from '../../../../../../injectEndpoints/messManagementEndpoints';

interface Props {
  navigation: any;
}

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

const MessMasterList = ({ navigation }: Props) => {
  const [listApi] = useMessManagementListMessMutation();
  const [deleteApi] = useMessManagementDeleteMessMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const list = useCallback(
    (pageNumber: number, initial: boolean, keyword: string) => {
      initial ? setInitialCall(true) : setInitialCall(false);
      const params = {
        search: keyword,
        sort: {
          attributes: ['id'],
          sorts: ['desc'],
        },
        filters: [],
        pageNo: pageNumber,
        itemsPerPage: ITEMS_PER_PAGE,
        bipardCentre: [],
      };

      listApi(params)
        .unwrap()
        .then((res: any) => {
          const newData = res.data?.data ?? [];
          const nextTotalCount = res?.data?.totalCount ?? 0;

          setInitialCall(false);
          setPagination(false);
          setRefreshing(false);
          setData(prev =>
            pageNumber !== 1 && prev.length > 0 ? [...prev, ...newData] : newData,
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
    [listApi],
  );

  useFocusEffect(
    useCallback(() => {
      list(1, true, search);
    }, [list, search]),
  );

  const deleteData = useCallback(
    (item: any) => {
      navigation.navigate(screensName.AlertOrganism, {
        title: strings.guest.deleteConfirmation,
        message: strings.guest.deleteItemConfirmation,
        okText: strings.guest.confirm,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          setInitialCall(true);
          deleteApi({ id: item.id })
            .unwrap()
            .then((res: any) => {
              Toast.show({
                type: 'success',
                text2: res?.data?.message || 'Mess deleted',
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
    [deleteApi, list, navigation, search],
  );

  const headerConfig = useMemo<AdminListHeaderConfig>(
    () => ({
      title: 'Mess',
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
          navigation.navigate(screensName.AddMessMaster, {
            onDone: () => list(1, true, search),
          }),
      },
    }),
    [list, navigation, search, totalCount],
  );

  const renderInfo = (label: string, value: any) => (
    <View style={styles.infoItem}>
      <TextAtom style={styles.infoLabel}>{label}</TextAtom>
      <TextAtom numberOfLines={1} style={styles.infoValue}>
        {value}
      </TextAtom>
    </View>
  );

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TextAtom numberOfLines={1} style={styles.cardTitle}>
          {field(item, ['messName', 'name'], 'Mess Name')}
        </TextAtom>
        <TouchableAtom style={styles.actionButton} onPress={() => deleteData(item)}>
          <SvgDelete width={vw(16)} height={vw(16)} />
        </TouchableAtom>
        <TouchableAtom
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate(screensName.AddMessMaster, {
              item,
              onDone: () => list(1, true, search),
            })
          }
        >
          <SvgEditPencile width={vw(16)} height={vw(16)} />
        </TouchableAtom>
      </View>

      <View style={styles.infoGrid}>
        {renderInfo('Capacity', field(item, ['capacity'], '524'))}
        {renderInfo('Incharge Name', field(item, ['inchargeName', 'inChargeName'], 'Ramesh Kumar'))}
        {renderInfo('Incharge Mobile No.', field(item, ['inchargeMobileNo', 'inchargeContactNo'], '9876543210'))}
        {renderInfo('Updated By', field(item, ['updatedBy'], 'Bipard Gaya'))}
        {renderInfo('Created By', field(item, ['createdBy'], 'Bipard Gaya'))}
        <View style={styles.infoItem}>
          <TextAtom style={styles.infoLabel}>Status</TextAtom>
          <TextAtom style={styles.statusPill}>
            {field(item, ['status'], 'Active')}
          </TextAtom>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
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
        renderItem={renderItem}
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
    </SafeAreaView>
  );
};

export default MessMasterList;

export const messListStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  searchBox: {
    marginTop: vh(10),
  },
  listContent: {
    paddingTop: vh(10),
    paddingBottom: vh(24),
  },
  card: {
    borderRadius: vw(8),
    paddingHorizontal: vw(16),
    paddingVertical: vh(16),
    backgroundColor: colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(18),
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  actionButton: {
    width: vw(30),
    height: vw(30),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginLeft: vw(10),
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: vh(10),
    paddingRight: vw(8),
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
    marginBottom: vh(4),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.new_ui_heading,
  },
  statusPill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: vw(4),
    backgroundColor: '#E5F1FE',
    paddingHorizontal: vw(6),
    paddingVertical: vh(3),
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.new_ui_heading,
  },
  separator: {
    height: vh(10),
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
  footerLoader: {
    marginTop: vh(15),
  },
});

const styles = messListStyles;
