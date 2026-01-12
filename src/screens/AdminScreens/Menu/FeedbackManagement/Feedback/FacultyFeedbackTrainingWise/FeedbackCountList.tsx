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
  vh,
  vw,
  screensName,
  strings,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useListTrainingWiseFeedbackCountMutation } from '../../../../../../injectEndpoints/feedbackManagementEndpoints';
import moment from 'moment';
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';

interface Props {
  navigation: NavigationType;
  route: any;
}

interface TrainingItem {
  trainingId: number;
  trainingName: string;
  feedbackCount: number;
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

const BedItemSeparator = () => <View style={styles.itemSeparator} />;

const FeedbackCountList = ({ navigation, route }: Props) => {
  const appliedFilters = route.params?.appliedFilters || [];
  const facultyItem = route.params?.item;
  const [listTrainingWise] = useListTrainingWiseFeedbackCountMutation();

  const [data, setData] = useState<TrainingItem[]>([]);
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(false);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [search, setSearch] = useState('');

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Feedback Count');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchTrainingList(1, '', true);
    }, []),
  );

  const handleSearch = useCallback(
    debounce((text: string) => {
      fetchTrainingList(1, text, true);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    fetchTrainingList(1, '', true);
  };

  const getDateFromFilters = (key: string) => {
    const obj = appliedFilters.find((f: any) => f.name === key);

    if (!obj?.value) return null;

    return moment(obj.value).format('YYYY-MM-DD');
  };

  const getTrainingIdsArray = (ids?: string) => {
    if (!ids) return [];
    return ids.split(',').map(id => id.trim());
  };

  const fetchTrainingList = (
    pageNo: number,
    keyword: string,
    initial = false,
  ) => {
    initial ? setInitialLoading(true) : setPaginationLoading(true);

    const params = {
      id: getTrainingIdsArray(facultyItem?.trainingIds),
      facultyId: facultyItem?.facultyId,
      pageNo,
      itemsPerPage: ITEMS_PER_PAGE,
      startDate: getDateFromFilters('startDate'),
      endDate: getDateFromFilters('endDate'),
      search: keyword,
    };

    listTrainingWise(params)
      .unwrap()
      .then((res: any) => {
        const newData = res?.data?.data ?? [];

        setData(prev => (pageNo === 1 ? newData : [...prev, ...newData]));

        const totalCount = res?.data?.totalCount ?? 0;
        setNextPageAvailable(pageNo * ITEMS_PER_PAGE < totalCount);
        setPage(pageNo);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      })
      .finally(() => {
        setInitialLoading(false);
        setPaginationLoading(false);
        setRefreshing(false);
      });
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: TrainingItem;
    index: number;
  }) => {
    return (
      <TouchableAtom
        style={styles.card}
        onPress={() => {
          navigation.navigate(screensName.FeedbackGivenByTraineeList, {
            appliedFilters,
            item,
          });
        }}
      >
        <View style={[styles.rowBetween, { marginBottom: vh(10) }]}>
          <TextAtom style={[styles.label, styles.flex1]}>
            {strings.hostelManagement.hostelAllocationHistory.srNo} {index + 1}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Training Name'}</TextAtom>
          <TextAtom style={styles.value}>{item.trainingName ?? '-'}</TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>{'Feedback Count'}</TextAtom>
          <TextAtom style={[styles.value, { color: colors.primary }]}>
            {item.feedbackCount ?? '-'}
          </TextAtom>
        </View>
      </TouchableAtom>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FullscreenLoading isVisible={initialLoading} />
      <SearchBoxOrganism
        onChangeText={onChangeSearch}
        searchText={search}
        onPressCross={onClearSearch}
        searchBox={{ marginTop: vh(15) }}
      />
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: vh(20), paddingTop: vh(10) }}
        ListEmptyComponent={
          initialLoading ? null : (
            <TextAtom style={styles.emptyText}>No data found</TextAtom>
          )
        }
        ListFooterComponent={
          paginationLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginVertical: vh(10) }}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTrainingList(1, '', true);
            }}
            colors={[colors.primary]}
          />
        }
        onEndReached={() => {
          if (nextPageAvailable && !paginationLoading) {
            fetchTrainingList(page + 1, search, false);
          }
        }}
        onEndReachedThreshold={0.3}
        ItemSeparatorComponent={BedItemSeparator}
      />
    </SafeAreaView>
  );
};

export default FeedbackCountList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  headerRow: {
    flexDirection: 'row',
    paddingVertical: vh(10),
    paddingHorizontal: vw(15),
    backgroundColor: colors.lightGray2,
  },

  headerText: {
    flex: 1,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
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
  flex1: { flex: 1 },
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  srNo: {
    flex: 0.5,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.black,
  },

  trainingName: {
    flex: 2,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.black,
  },

  classCount: {
    flex: 1,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    textAlign: 'center',
    color: colors.primary,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  itemSeparator: { height: vh(10) },
});
