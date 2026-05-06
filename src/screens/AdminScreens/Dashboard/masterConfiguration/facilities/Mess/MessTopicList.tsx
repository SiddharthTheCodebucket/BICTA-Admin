import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
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
  useMessManagementDeleteMessTopicMutation,
  useMessManagementListMessTopicMutation,
} from '../../../../../../injectEndpoints/messManagementEndpoints';
import { messListStyles } from './MessMasterList';

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

const thumbnailUrl = (item: any) => {
  const thumbnail = item?.thumbnail;
  if (typeof thumbnail === 'string') return thumbnail;
  return thumbnail?.url ?? item?.thumbnailUrl ?? '';
};

const MessTopicList = ({ navigation }: Props) => {
  const [listApi] = useMessManagementListMessTopicMutation();
  const [deleteApi] = useMessManagementDeleteMessTopicMutation();

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
                text2: res?.data?.message || 'Mess topic deleted',
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
      title: 'Mess Topic',
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
          navigation.navigate(screensName.AddMessTopic, {
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

  const renderItem = ({ item }: any) => {
    const url = thumbnailUrl(item);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={1} style={styles.cardTitle}>
            {field(item, ['messName', 'name'], 'Mess Name')}
          </TextAtom>
          <TouchableAtom
            style={styles.actionButton}
            onPress={() => deleteData(item)}
          >
            <SvgDelete />
          </TouchableAtom>
          <TouchableAtom
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate(screensName.AddMessTopic, {
                item,
                onDone: () => list(1, true, search),
              })
            }
          >
            <SvgEditPencile />
          </TouchableAtom>
        </View>

        <View style={styles.infoGrid}>
          {renderInfo(
            'Topic',
            field(item, ['topic', 'topicName'], 'Breakfast'),
          )}
          {renderInfo('Description', field(item, ['description'], 'N/A'))}
          {renderInfo('Updated By', field(item, ['updatedBy'], 'Bipard Gaya'))}
          {renderInfo('Created By', field(item, ['createdBy'], 'Bipard Gaya'))}
          <View style={styles.infoItem}>
            <TextAtom style={styles.infoLabel}>Status</TextAtom>
            <TextAtom style={styles.statusPill}>
              {field(item, ['status'], 'Active')}
            </TextAtom>
          </View>
          <View style={styles.infoItem}>
            <TextAtom style={styles.infoLabel}>Thumbnail</TextAtom>
            <View style={styles.thumbnailRow}>
              <View style={styles.thumbnailPlaceholder} />
              <TouchableAtom
                style={styles.viewButton}
                onPress={() => {
                  if (url) Linking.openURL(url);
                }}
              >
                <TextAtom style={styles.viewButtonText}>View</TextAtom>
              </TouchableAtom>
            </View>
          </View>
        </View>
      </View>
    );
  };

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

export default MessTopicList;

const styles = StyleSheet.create({
  ...messListStyles,
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    width: vw(42),
    height: vh(24),
    borderRadius: vw(4),
    backgroundColor: '#E8E8E8',
    marginRight: vw(6),
  },
  viewButton: {
    height: vh(24),
    minWidth: vw(45),
    borderRadius: vw(5),
    backgroundColor: colors.primary_dark_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonText: {
    color: colors.white,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(12),
  },
});
