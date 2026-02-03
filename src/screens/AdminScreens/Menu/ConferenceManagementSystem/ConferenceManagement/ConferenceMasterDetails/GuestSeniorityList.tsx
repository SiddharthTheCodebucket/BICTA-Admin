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
import { colors, fonts, images, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import moment from 'moment';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';
import { useConferenceGuestSeniorityListMutation } from '../../../../../../injectEndpoints/conferenceManagementEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
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

interface VendorCardProps {
  item: any;
  index: number;
  navigation: any;
}

const VendorCard: React.FC<VendorCardProps> = ({ item, index, navigation }) => {
  const formatDateTime = (date?: string) => {
    if (!date) return '-';
    return moment(`${date}`, 'YYYY-MM-DD').format('DD-MM-YYYY');
  };

  return (
    <ViewAtom style={styles.card}>
      <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
        <TextAtom style={[styles.label, { flex: 1 }]}>
          Sr. No: {index + 1}
        </TextAtom>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Conference Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.conferenceName ?? '-'}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Guest Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {`${item.salutation} ${item.guestName}`}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Service Cadre</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.serviceCaderName ?? '-'}
        </TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Batch Year</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.batchYear}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.labelRight}>To</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {formatDateTime(item.arrivalDate)}
          </TextAtom>
        </View>
      </View>
    </ViewAtom>
  );
};

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const GuestSeniorityList = (props: Props) => {
  const { navigation } = props;

  const item = props.route.params.item;

  const [listApi] = useConferenceGuestSeniorityListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Guest Seniority List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      list(1, true, '');
    }, []),
  );

  const list = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
    extraParams: any = {},
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      conferenceId: item.id,
      ...extraParams,
    };

    listApi(params)
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

        if (res.data.exportUrl) {
          downloadAndOpenFile(res.data.exportUrl);
        }

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

  const renderlist = useCallback(
    ({ item, index }: any) => (
      <VendorCard item={item} index={index} navigation={navigation} />
    ),
    [navigation],
  );

  const downloadPdf = () => {
    list(1, true, '', [], {
      exportFlag: true,
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {data?.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'flex-end',
          }}
        >
          <TouchableAtom style={styles.filterButton} onPress={downloadPdf}>
            <ImageAtom
              source={images.download}
              style={{ tintColor: colors.black }}
            />
          </TouchableAtom>
        </View>
      )}
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderlist}
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
              list(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable ? list(page + 1, false, '') : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export default GuestSeniorityList;

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
  filterButton: {
    borderWidth: vw(1),
    borderColor: colors.primary,
    borderRadius: vw(4),
    marginTop: vh(10),
    alignSelf: 'flex-end',
    marginRight: vh(15),
    paddingHorizontal: vw(10),
    paddingVertical: vh(5),
  },
});
