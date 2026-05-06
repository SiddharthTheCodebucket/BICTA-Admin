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
} from '../../../../../constants';
import AdminListHeader, {
  AdminListHeaderConfig,
} from '../../../../../components/organisms/AdminListHeader';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../components/organisms/SearchBoxOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import ImageFieldPreview from '../../../../../components/molecules/ImageFieldPreview';
import {
  useDeleteVehicleDetailsMutation,
  useListVehicleDetailsMutation,
} from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';

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

const VehicleMaster = ({ navigation }: Props) => {
  const [listApi] = useListVehicleDetailsMutation();
  const [deleteApi] = useDeleteVehicleDetailsMutation();

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

      listApi({
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
        title: 'Delete Confirmation',
        message: 'Are you sure you want to delete this item?',
        okText: 'Confirm',
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          setInitialCall(true);
          deleteApi({ id: item.id })
            .unwrap()
            .then((res: any) => {
              Toast.show({
                type: 'success',
                text2: res?.data?.message || 'Vehicle deleted',
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
      title: 'Vehicle Registration',
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
          navigation.navigate(screensName.AddVehicle, {
            fromFacilities: true,
            onDone: () => list(1, true, search),
          }),
      },
    }),
    [list, navigation, search, totalCount],
  );

  const renderInfo = (label: string, nextValue: any) => (
    <View style={styles.infoItem}>
      <TextAtom style={styles.infoLabel}>{label}</TextAtom>
      <TextAtom numberOfLines={1} style={styles.infoValue}>
        {nextValue}
      </TextAtom>
    </View>
  );

  const renderPreview = (label: string, imageUri?: string) => (
    <ImageFieldPreview
      label={label}
      imageUri={imageUri}
      containerStyle={styles.previewItem}
      thumbnailBoxStyle={styles.previewThumbBox}
      thumbnailStyle={styles.previewThumb}
      actionButtonStyle={styles.previewButton}
      actionLabel="View"
    />
  );

  const renderStatus = (status: string) => (
    <View style={styles.statusWrap}>
      <TextAtom style={styles.infoLabel}>Status</TextAtom>
      <View style={styles.statusRow}>
        {['Active', 'Inactive'].map(nextStatus => {
          const active = status === nextStatus || status === 'In-Active';
          const selected =
            nextStatus === 'Active'
              ? status === 'Active'
              : active && status !== 'Active';
          return (
            <View
              key={nextStatus}
              style={[styles.statusPill, selected && styles.statusPillActive]}
            >
              <TextAtom
                style={[
                  styles.statusText,
                  selected && styles.statusTextActive,
                ]}
              >
                {nextStatus}
              </TextAtom>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderItem = ({ item }: any) => {
    const rcUrl = item?.rcFile;
    const qrValue = item?.qrCode ?? item?.registrationNo ?? '';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrValue}`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={1} style={styles.cardTitle}>
            {field(item, ['vehicleName'], 'Vehicle Name')}
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
              navigation.navigate(screensName.AddVehicle, {
                item,
                fromFacilities: true,
                onDone: () => list(1, true, search),
              })
            }
          >
            <SvgEditPencile />
          </TouchableAtom>
        </View>

        <View style={styles.infoGrid}>
          {renderInfo(
            'Vehicle Registration no.',
            field(item, ['registrationNo'], 'd5f54ss5'),
          )}
          {renderInfo(
            'Vehicle Color',
            field(item, ['vehicleColor'], 'Rohit Kumar'),
          )}
          {renderInfo(
            'Vehicle Owner Name',
            field(item, ['ownerName'], 'Ramesh'),
          )}
          {renderInfo(
            'Vehicle Owner Mobile No.',
            field(item, ['ownerContactNo'], '9876543210'),
          )}
          {renderPreview('Vehicle RC', rcUrl)}
          {renderPreview('Vehicle QR', qrUrl)}
        </View>

        {renderStatus(field(item, ['status'], 'Inactive'))}
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

export default VehicleMaster;

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
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingVertical: vh(14),
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
    marginBottom: vh(9),
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
  previewItem: {
    width: '50%',
    marginBottom: vh(9),
    paddingRight: vw(8),
  },
  previewThumbBox: {
    width: vw(40),
    height: vh(24),
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: '#EDEFF3',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
  },
  previewButton: {
    height: vh(24),
    minWidth: 0,
    minHeight: vh(24),
    borderRadius: vw(4),
    backgroundColor: colors.primary_dark_blue,
    paddingHorizontal: vw(10),
    marginLeft: vw(8),
  },
  statusWrap: {
    marginTop: vh(2),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    minHeight: vh(22),
    paddingHorizontal: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F1FF',
    borderRadius: vw(3),
  },
  statusPillActive: {
    backgroundColor: colors.primary_blue,
  },
  statusText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.primary_dark_blue,
  },
  statusTextActive: {
    color: colors.white,
  },
  separator: {
    height: vh(12),
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
