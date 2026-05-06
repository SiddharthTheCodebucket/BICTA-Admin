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
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../../components/organisms/AdminListHeader';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import {
  useHouseKeepingDeleteTaskMasterMutation,
  useHouseKeepingListTaskMasterMutation,
} from '../../../../../../injectEndpoints/houseKeepingManagementEndpoints';

interface Props {
  navigation: any;
}

const ITEMS_PER_PAGE = 10;
const ListItemSeparator = () => <View style={styles.separator} />;

const value = (item: any, keys: string[], fallback = '-') => {
  for (const key of keys) {
    const nextValue = item?.[key];
    if (nextValue !== undefined && nextValue !== null && nextValue !== '') {
      return nextValue;
    }
  }
  return fallback;
};

const namesFrom = (item: any, key: string) => {
  const names = item?.[key];
  if (Array.isArray(names)) return names.filter(Boolean);
  if (typeof names === 'string')
    return names
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);
  return [];
};

const HouseKeepingMasterList = ({ navigation }: Props) => {
  const [listApi] = useHouseKeepingListTaskMasterMutation();
  const [deleteApi] = useHouseKeepingDeleteTaskMasterMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [staffModalNames, setStaffModalNames] = useState<string[]>([]);

  const list = useCallback(
    (pageNumber: number, initial: boolean, keyword: string) => {
      initial ? setInitialCall(true) : setInitialCall(false);

      const params = {
        search: keyword,
        sort: {
          attributes: ['createdAt'],
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
                text2: res?.data?.message || 'Task deleted',
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
      title: 'Task Details',
      count: totalCount,
      search: {
        visible: true,
        onPress: () => setShowSearch(prev => !prev),
      },
      create: {
        visible: true,
        onPress: () =>
          navigation.navigate(screensName.AddHouseKeepingTask, {
            onDone: () => list(1, true, search),
          }),
      },
    }),
    [list, navigation, search, totalCount],
  );

  const renderInfo = (label: string, nextValue: any) => (
    <View style={styles.infoItem}>
      <TextAtom style={styles.infoLabel}>{label}</TextAtom>
      <TextAtom numberOfLines={2} style={styles.infoValue}>
        {nextValue}
      </TextAtom>
    </View>
  );

  const renderItem = ({ item, index }: any) => {
    const id = (item?.id ?? index).toString();
    const staffNames = namesFrom(item, 'staffName');
    const isExpanded = expandedIds[id] ?? index === 0;
    const firstStaff = staffNames[0] ?? '-';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={1} style={styles.cardTitle}>
            {value(item, ['taskTitle'], 'Task Title')}
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
              navigation.navigate(screensName.AddHouseKeepingTask, {
                item,
                onDone: () => list(1, true, search),
              })
            }
          >
            <SvgEditPencile />
          </TouchableAtom>
        </View>

        <View style={styles.infoGrid}>
          {renderInfo('Task Type', value(item, ['taskType']))}
          {renderInfo('Location Campus', value(item, ['locationCampus']))}
          {renderInfo('Building Type', value(item, ['buildingType']))}
          {renderInfo('Building Or Area', value(item, ['buildingOrArea']))}
          <View style={styles.infoItem}>
            <TextAtom style={styles.infoLabel}>Staff Name</TextAtom>
            <View style={styles.inlineRow}>
              <TextAtom
                numberOfLines={1}
                style={[styles.infoValue, styles.staffName]}
              >
                {firstStaff}
                {staffNames.length > 1 ? ',' : ''}
              </TextAtom>
              {staffNames.length > 1 && (
                <TouchableAtom onPress={() => setStaffModalNames(staffNames)}>
                  <TextAtom style={styles.viewAll}>View All</TextAtom>
                </TouchableAtom>
              )}
            </View>
          </View>
          {renderInfo(
            'Support Admin Name',
            namesFrom(item, 'supportAdminName').join(', ') || '-',
          )}
        </View>

        <TextAtom style={styles.infoLabel}>Description</TextAtom>
        <TextAtom numberOfLines={isExpanded ? 0 : 2} style={styles.blockValue}>
          {value(item, ['taskDescription', 'description'])}
        </TextAtom>

        {isExpanded && (
          <>
            <TextAtom style={styles.infoLabel}>Required Skills</TextAtom>
            <TextAtom style={styles.blockValue}>
              {value(item, ['requiredSkills'])}
            </TextAtom>
          </>
        )}

        <TouchableAtom
          style={styles.moreButton}
          onPress={() =>
            setExpandedIds(prev => ({
              ...prev,
              [id]: !isExpanded,
            }))
          }
        >
          <TextAtom style={styles.moreText}>
            {isExpanded ? 'View Less' : 'View More'}
          </TextAtom>
        </TouchableAtom>
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

      <AdminBottomModal
        visible={staffModalNames.length > 0}
        title="Staff Names"
        onClose={() => setStaffModalNames([])}
        sheetStyle={styles.staffSheet}
      >
        <View style={styles.staffListBox}>
          {staffModalNames.map((name, index) => (
            <TextAtom key={`${name}-${index}`} style={styles.staffModalName}>
              {name}
              {index === 0 ? ',' : ''}
            </TextAtom>
          ))}
        </View>
        <FormGradientButton
          title="Okay"
          onPress={() => setStaffModalNames([])}
          containerStyle={styles.modalButton}
          buttonStyle={styles.modalButtonInner}
        />
      </AdminBottomModal>
    </SafeAreaView>
  );
};

export default HouseKeepingMasterList;

const styles = StyleSheet.create({
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
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffName: {
    maxWidth: vw(82),
  },
  viewAll: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(10),
    color: colors.primary_blue,
    marginLeft: vw(4),
  },
  blockValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.new_ui_heading,
    lineHeight: vh(18),
    marginBottom: vh(10),
  },
  moreButton: {
    alignSelf: 'flex-start',
  },
  moreText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(14),
    color: '#D18A00',
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
  staffSheet: {
    borderTopLeftRadius: vw(26),
    borderTopRightRadius: vw(26),
  },
  staffListBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: vw(8),
    paddingHorizontal: vw(14),
    paddingVertical: vh(12),
    marginTop: vh(8),
  },
  staffModalName: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.new_ui_heading,
    lineHeight: vh(28),
  },
  modalButton: {
    marginTop: vh(28),
  },
  modalButtonInner: {
    height: vh(40),
    borderRadius: vw(7),
  },
});
