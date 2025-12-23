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
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../../components/organisms/SearchBoxOrganism';
import TouchableAtom from '../../../../../components/atoms/TouchableAtom';
import { useCommunicationListApplicationUserMutation } from '../../../../../injectEndpointsTrainee/showCauseNoticeEndpoints';

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

const Application = (props: Props) => {
  const { navigation } = props;

  const [communicationListApplicationUserApi] =
    useCommunicationListApplicationUserMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.application_review_data);
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      communicationListApplicationUser(1, true, '');
    }, []),
  );

  const communicationListApplicationUser = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);
    const params = {
      search: keyword,
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
    };

    communicationListApplicationUserApi(params)
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
      communicationListApplicationUser(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    communicationListApplicationUser(1, true, '');
  };

  const renderApplicationCard = ({ item, index }: any) => (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.ApplicationDetails, {
          data: item,
        });
      }}
    >
      <View style={styles.rowBetween}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>Sr. No.</TextAtom>
          <TextAtom style={styles.value}>{index + 1}</TextAtom>
        </View>

        <View style={styles.flexEnd}>
          <TextAtom style={styles.label}>Status</TextAtom>
          <TextAtom style={[styles.value, { color: colors.primary }]}>
            {item.applicationStatus ?? '-'}
          </TextAtom>
        </View>
      </View>

      <View style={styles.marginTop}>
        <TextAtom style={styles.label}>Title</TextAtom>
        <TextAtom numberOfLines={2} style={styles.value}>
          {item.title || '-'}
        </TextAtom>
      </View>

      <View style={styles.marginTop8}>
        <TextAtom style={styles.label}>Category</TextAtom>
        <TextAtom style={styles.value}>{item.category || '-'}</TextAtom>
      </View>

      <View style={[styles.rowBetween, { marginTop: vh(10) }]}>
        <View style={styles.flex1}>
          <TextAtom style={styles.label}>Application Date</TextAtom>
          <TextAtom style={styles.value}>
            {item.createdAt ? moment(item.createdAt).format('DD-MM-YYYY') : '-'}
          </TextAtom>
        </View>

        <View style={styles.flexCenter}>
          <TextAtom style={styles.label}>From Date</TextAtom>
          <TextAtom style={styles.value}>
            {item.dateFrom ? moment(item.dateFrom).format('DD-MM-YYYY') : '-'}
          </TextAtom>
        </View>

        <View style={styles.flexEnd}>
          <TextAtom style={styles.label}>To Date</TextAtom>
          <TextAtom style={styles.value}>
            {item.dateTo ? moment(item.dateTo).format('DD-MM-YYYY') : '-'}
          </TextAtom>
        </View>
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
        renderItem={renderApplicationCard}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.no_application_found}
            </TextAtom>
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
              communicationListApplicationUser(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? communicationListApplicationUser(page + 1, false, '')
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ItemSeparator}
      />
    </SafeAreaView>
  );
};

export default Application;

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
    paddingVertical: vh(5),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
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
  flex1: {
    flex: 1,
  },
  flexEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  flexCenter: {
    flex: 1,
    alignItems: 'center',
  },
  marginTop: {
    marginTop: vh(10),
  },
  marginTop8: {
    marginTop: vh(8),
  },
});
