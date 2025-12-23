import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, screensName, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import { useSupportListMutation } from '../../../../injectEndpointsTrainee/supportEndpoints';
import FloatingButton from '../../../../components/organisms/FloatingButton';

interface Props {
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

const ItemSeparator = () => <View style={{ height: vh(10) }} />;

const Support = (props: Props) => {
  const { navigation } = props;

  const [supportListApi] = useSupportListMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Complain Data');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      supportList(1, true, '');
    }, []),
  );

  const supportList = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
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
    };

    supportListApi(params)
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

  const handleSearch = useCallback(
    debounce((text: string) => {
      supportList(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    supportList(1, true, '');
  };

  const renderSupportListCard = ({ item, index }: any) => (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.SupportViewAndReply, {
          item: item,
          onDone: () => supportList(1, true, search),
        });
      }}
    >
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Sr. No.</TextAtom>
          <TextAtom style={styles.value}>{index + 1}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Tracking Id</TextAtom>
          <TextAtom style={styles.value}>{item.trackingId ?? '-'}</TextAtom>
        </View>
      </View>

      <View style={[styles.rowBetween, { marginTop: vh(8) }]}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Category</TextAtom>
          <TextAtom style={styles.value}>{item.category ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Sub Category</TextAtom>
          <TextAtom style={styles.value}>{item.subCategory ?? '-'}</TextAtom>
        </View>
      </View>

      <View style={[styles.rowBetween, { marginTop: vh(8) }]}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Complain Date</TextAtom>
          <TextAtom style={styles.value}>
            {item.createdDate
              ? moment(item.createdDate).format('DD/MM/YYYY')
              : '-'}
          </TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Status</TextAtom>
          <TextAtom style={[styles.value, { color: colors.primary }]}>
            {item.currentStatus ?? '-'}
          </TextAtom>
        </View>
      </View>

      <View style={{ marginTop: vh(10) }}>
        <TextAtom style={styles.label}>Issue Type</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.issueType ?? '-'}
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom style={styles.label}>Description</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.description ?? '-'}
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom style={styles.label}>Subject</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.subject ?? '-'}
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom style={styles.label}>File</TextAtom>
        {item.userUploadFile ? (
          <TouchableAtom onPress={() => Linking.openURL(item.userUploadFile)}>
            <TextAtom style={[styles.value, { color: colors.primary }]}>
              View File
            </TextAtom>
          </TouchableAtom>
        ) : (
          <TextAtom style={styles.value}>No File</TextAtom>
        )}
      </View>
    </TouchableAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderSupportListCard}
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
              supportList(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? supportList(page + 1, false, '')
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ItemSeparator}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.AddSupport, {
            onDone: () => supportList(1, true, search),
          });
        }}
      />
    </SafeAreaView>
  );
};

export default Support;

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
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    marginBottom: vh(5),
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
