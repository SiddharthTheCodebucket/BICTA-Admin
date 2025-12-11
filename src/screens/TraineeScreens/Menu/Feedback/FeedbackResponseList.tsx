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
import { colors, fonts, screensName, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../components/organisms/FullscreenLoading';
import SearchBoxOrganism from '../../../../components/organisms/SearchBoxOrganism';
import FloatingButton from '../../../../components/organisms/FloatingButton';
import ViewAtom from '../../../../components/atoms/ViewAtom';
import { useListfeedbackResponseMutation } from '../../../../injectEndpointsTrainee/feedbackEndpoints';

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

const FeedbackResponseList = (props: Props) => {
  const { navigation } = props;

  const [ListfeedbackResponseApi] = useListfeedbackResponseMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Feedback Response List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      ListfeedbackResponse(1, true, '');
    }, []),
  );

  const ListfeedbackResponse = (
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
    ListfeedbackResponseApi(params)
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
      ListfeedbackResponse(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    ListfeedbackResponse(1, true, '');
  };

  const renderFeedbackResCard = ({ item, index }: any) => (
    <ViewAtom style={styles.card}>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>
          Sr. No.: <TextAtom style={styles.value}>{index + 1}</TextAtom>
        </TextAtom>
      </View>
      <View
        style={{
          width: '100%',
          height: vh(1),
          backgroundColor: colors.chinese_silver,
          marginTop: vh(8),
        }}
      />

      <View style={{ marginTop: vh(5) }}>
        <TextAtom numberOfLines={0} style={styles.label}>
          Trainee Name:{' '}
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.traineeName || '-'}
          </TextAtom>
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom numberOfLines={0} style={styles.label}>
          Training Name:{' '}
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.trainingName || '-'}
          </TextAtom>
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom numberOfLines={0} style={styles.label}>
          Batch Name:{' '}
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.batchName || '-'}
          </TextAtom>
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom numberOfLines={0} style={styles.label}>
          Category Name:{' '}
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.categoryName || '-'}
          </TextAtom>
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom numberOfLines={0} style={styles.label}>
          Topic Name:{' '}
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.topicName || '-'}
          </TextAtom>
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom style={styles.label}>
          Response:{' '}
          <TextAtom style={styles.value}>{item.response || '-'}</TextAtom>
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8) }}>
        <TextAtom style={styles.label}>
          Response Date:{' '}
          <TextAtom style={styles.value}>
            {item.responseDate
              ? moment(item.responseDate).format('DD/MM/YYYY')
              : '-'}
          </TextAtom>
        </TextAtom>
      </View>

      <View style={{ marginTop: vh(8), marginBottom: vh(5) }}>
        <TextAtom numberOfLines={0} style={styles.label}>
          Remarks:{' '}
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.remark || '-'}
          </TextAtom>
        </TextAtom>
      </View>
    </ViewAtom>
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
        renderItem={renderFeedbackResCard}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          ) : null
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
              ListfeedbackResponse(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? ListfeedbackResponse(page + 1, false, '')
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
      <FloatingButton
        onButtonPress={() => {
          navigation.navigate(screensName.FeedbackResponse);
        }}
      />
    </SafeAreaView>
  );
};

export default FeedbackResponseList;

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
    paddingVertical: vh(10),
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
