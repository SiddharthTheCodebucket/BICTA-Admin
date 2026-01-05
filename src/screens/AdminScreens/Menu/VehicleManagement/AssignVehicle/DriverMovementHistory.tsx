import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { colors, fonts, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import { useListAssignVehicleDriverMutation } from '../../../../../injectEndpoints/vehicleManagemnetEndpoints';
import moment from 'moment';

interface Props {
  route: any;
  navigation: NavigationType;
}

const DriverItemSeparator = () => <View style={{ height: vh(10) }} />;

interface DriverCardProps {
  item: any;
}

const DriverCard = ({ item }: DriverCardProps) => {
  return (
    <View style={styles.card}>
      <View style={{ marginBottom: vh(8) }}>
        <TextAtom style={styles.label}>Driver Name</TextAtom>
        <TextAtom style={styles.value}>{item.driverName ?? '-'}</TextAtom>
      </View>

      <View style={{ marginBottom: vh(8) }}>
        <TextAtom style={styles.label}>Driver Email</TextAtom>
        <TextAtom style={styles.value}>{item.driverEmail ?? '-'}</TextAtom>
      </View>

      <View style={[styles.rowBetween, { marginTop: vh(5) }]}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>From Date</TextAtom>
          <TextAtom style={styles.value}>
            {item.fromDate ? moment(item.fromDate).format('DD-MM-YYYY') : '-'}
          </TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.labelRight}>To Date</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.toDate ? moment(item.toDate).format('DD-MM-YYYY') : '-'}
          </TextAtom>
        </View>
      </View>
    </View>
  );
};

const DriverMovementHistory = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params.item;

  const [listAssignVehicleDriverApi] = useListAssignVehicleDriverMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Driver Movement History');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useEffect(() => {
    listAssignDriverDetails(1, true, '');
  }, []);

  const listAssignDriverDetails = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: keyword,
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      assignVehicleId: item.vehicleId,
    };

    listAssignVehicleDriverApi(params)
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
        setNextPageAvailable(pageNumber * ITEMS_PER_PAGE < totalCount);
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
  };

  const renderItem = ({ item }: any) => {
    return <DriverCard item={item} />;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          pagination ? (
            <ActivityIndicator
              size={'small'}
              color={colors.primary}
              style={{ marginTop: vh(15) }}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            colors={[colors.primary]}
            onRefresh={() => {
              setRefreshing(true);
              listAssignDriverDetails(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          if (nextPageAvailable) {
            setPagination(true);
            listAssignDriverDetails(page + 1, false, '');
          }
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={DriverItemSeparator}
      />
    </SafeAreaView>
  );
};

export default DriverMovementHistory;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  flatListContainer: {
    paddingVertical: vh(10),
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  labelRight: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    textAlign: 'right',
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
  },
  valueRight: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
    textAlign: 'right',
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
});
