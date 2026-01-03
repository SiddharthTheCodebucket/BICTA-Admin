import React, { useCallback, useLayoutEffect, useState } from 'react';
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
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import moment from 'moment';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { useListVendorPaymentHistoryMutation } from '../../../../../../injectEndpoints/invoiceManagementEndpoints';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import FloatingButton from '../../../../../../components/organisms/FloatingButton';

interface Props {
  route: any;
  navigation: NavigationType;
}

interface PaymentCardProps {
  item: any;
  index: number;
  navigation: any;
  onPressEdit: () => void;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  item,
  index,
  navigation,
  onPressEdit,
}) => {
  return (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.PaymentDetailDetails, { data: item });
      }}
    >
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, { flex: 1 }]}>
          Sr. No: {index + 1}
        </TextAtom>
        <View style={{ flexDirection: 'row', gap: vw(10) }}>
          <TouchableAtom
            style={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              borderRadius: vw(4),
              padding: vw(3),
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              onPressEdit();
            }}
          >
            <ImageAtom
              source={images.edit_pencil}
              style={{
                tintColor: colors.primary,
                width: vw(15),
                height: vw(15),
              }}
            />
          </TouchableAtom>
        </View>
      </View>
      <ViewAtom style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Payment Date</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {moment(item.paymentDate).format('DD-MM-YYYY') ?? '-'}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.labelRight}>Net Payment</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {item.netPayment ?? '-'}
          </TextAtom>
        </View>
      </ViewAtom>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Payment Remark</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.paymentRemark ?? '-'}
        </TextAtom>
      </View>
    </TouchableAtom>
  );
};

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const PaymentDetails = (props: Props) => {
  const { navigation } = props;
  const item = props.route?.params?.item ?? null;

  const [listVendorPaymentHistoryApi] = useListVendorPaymentHistoryMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Payment Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      listVendorPaymentHistory(1, true, '');
    }, []),
  );

  const listVendorPaymentHistory = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      uniqueId: item?.uniqueId,
      search: keyword,
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };
    listVendorPaymentHistoryApi(params)
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

  const onPressEdit = (item: any) => {
    navigation.navigate(screensName.AddPaymentDetails, {
      isEdit: true,
      item: item,
      onDone: () => listVendorPaymentHistory(1, true, search),
    });
  };

  const renderlistVendorPaymentHistory = useCallback(
    ({ item, index }: any) => (
      <PaymentCard
        item={item}
        index={index}
        navigation={navigation}
        onPressEdit={() => {
          onPressEdit(item);
        }}
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <TextAtom
        numberOfLines={0}
        style={{
          width: vw(330),
          alignSelf: 'center',
          fontSize: vw(16),
          fontFamily: fonts.Roboto_Bold,
          color: colors.black,
          marginTop: vh(5),
        }}
      >
        {`Payment Details - ${item.vendorName}`}
      </TextAtom>
      <TextAtom
        style={{
          width: vw(330),
          alignSelf: 'center',
          fontSize: vw(14),
          fontFamily: fonts.Roboto_Medium,
          color: colors.black,
          marginTop: vh(5),
        }}
      >
        {`Unique Id : ${item.uniqueId}`}
      </TextAtom>
      <ViewAtom
        style={[
          styles.rowBetween,
          { width: vw(330), alignSelf: 'center', marginTop: vh(5) },
        ]}
      >
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Outstanding Amount</TextAtom>
          <TextAtom style={styles.value}>
            {item.invoiceAmount - item.totalPaidAmount}
          </TextAtom>
        </View>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.labelRight}>Invoice Amount</TextAtom>
          <TextAtom style={styles.valueRight}>
            {item.invoiceAmount ?? '-'}
          </TextAtom>
        </View>
      </ViewAtom>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderlistVendorPaymentHistory}
        keyExtractor={(item, index) => index.toString()}
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
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listVendorPaymentHistory(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listVendorPaymentHistory(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddPaymentDetails, {
            item: item,
            onDone: () => listVendorPaymentHistory(1, true, search),
          });
        }}
      />
    </SafeAreaView>
  );
};

export default PaymentDetails;

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
    paddingVertical: vh(8),
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
  divider: {
    height: 1,
    backgroundColor: colors.chinese_silver,
    marginVertical: vh(5),
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
