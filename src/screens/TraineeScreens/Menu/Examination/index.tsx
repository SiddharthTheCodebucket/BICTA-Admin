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
import TouchableAtom from '../../../../components/atoms/TouchableAtom';
import { useListExaminationSubReportMutation } from '../../../../injectEndpointsTrainee/examinationEndpoints';

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

const Examination = (props: Props) => {
  const { navigation } = props;

  const [listExaminationSubReportApi] = useListExaminationSubReportMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);

  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Examination List');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  useFocusEffect(
    useCallback(() => {
      listExaminationSubReport(1, true, '');
    }, []),
  );

  const listExaminationSubReport = (
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

    listExaminationSubReportApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.user ?? [];
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
      listExaminationSubReport(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    listExaminationSubReport(1, true, '');
  };

  const renderExaminationCard = ({ item, index }: any) => (
    <TouchableAtom
      style={styles.card}
      onPress={() => {
        navigation.navigate(screensName.ExamResponseDetailsList, {
          id: item.id,
        });
      }}
    >
      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Sr. No.</TextAtom>
          <TextAtom style={styles.value}>{index + 1}</TextAtom>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TextAtom style={styles.label}>Examination Date</TextAtom>
          <TextAtom style={styles.value}>
            {item.testStartDate
              ? moment(item.testStartDate).format('DD/MM/YYYY')
              : '-'}
          </TextAtom>
        </View>
      </View>
      <View style={{ marginTop: vh(10) }}>
        <TextAtom style={styles.label}>Training Name:</TextAtom>
        <TextAtom numberOfLines={2} style={styles.value}>
          {item.trainingName || '-'}
        </TextAtom>
      </View>
      <View style={{ marginTop: vh(8) }}>
        <TextAtom style={styles.label}>Examination Name:</TextAtom>
        <TextAtom numberOfLines={2} style={styles.value}>
          {item.testName || '-'}
        </TextAtom>
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
        renderItem={renderExaminationCard}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          !initialCall ? (
            <TextAtom style={styles.emptyText}>
              No examination data found
            </TextAtom>
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
              listExaminationSubReport(1, false, '');
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listExaminationSubReport(page + 1, false, '')
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={{ height: vh(10) }} />}
      />
    </SafeAreaView>
  );
};

export default Examination;

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
