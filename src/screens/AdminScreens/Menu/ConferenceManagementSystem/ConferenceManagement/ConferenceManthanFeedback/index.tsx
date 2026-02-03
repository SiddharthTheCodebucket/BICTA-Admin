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
import SearchBoxOrganism from '../../../../../../components/organisms/SearchBoxOrganism';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';

import { useConferenceListManthanMutation } from '../../../../../../injectEndpoints/conferenceManagementEndpoints';

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

interface VendorCardProps {
  item: any;
  index: number;
  navigation: any;
}

const VendorCard: React.FC<VendorCardProps> = ({ item, index, navigation }) => {
  return (
    <ViewAtom style={styles.card}>
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
              navigation.navigate(screensName.FeedbackQuestionsResponse, {
                item: item,
              });
            }}
          >
            <ImageAtom
              source={images.eyeOpen}
              style={{
                tintColor: colors.primary,
                width: vw(15),
                height: vw(15),
              }}
            />
          </TouchableAtom>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.dmUserName ?? '-'}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>District Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.districtName ?? '-'}
        </TextAtom>
      </View>
      <View style={{ flex: 1 }}>
        <TextAtom style={styles.label}>Conference Name</TextAtom>
        <TextAtom numberOfLines={0} style={styles.value}>
          {item.conferenceName ?? '-'}
        </TextAtom>
      </View>

      <View style={styles.rowBetween}>
        <View style={{ flex: 1 }}>
          <TextAtom style={styles.label}>Status</TextAtom>
          <TextAtom numberOfLines={0} style={styles.value}>
            {item.status ?? '-'}
          </TextAtom>
        </View>

        <View style={{ flex: 1 }}>
          <TextAtom style={styles.labelRight}>Is FinalSubmit</TextAtom>
          <TextAtom numberOfLines={0} style={styles.valueRight}>
            {item.isFinalSubmit ?? '-'}
          </TextAtom>
        </View>
      </View>
    </ViewAtom>
  );
};

const ListItemSeparator = () => <View style={{ height: vh(10) }} />;

const ConferenceManthanFeedback = (props: Props) => {
  const { navigation } = props;

  const [listApi] = useConferenceListManthanMutation();

  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);

  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);

  const ITEMS_PER_PAGE = 10;

  const [search, setSearch] = React.useState('');

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Conference Feedback List');
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
      search: keyword,
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
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

  const handleSearch = useCallback(
    debounce((text: string) => {
      list(1, true, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    handleSearch(text);
  };

  const onClearSearch = () => {
    setSearch('');
    list(1, true, '');
  };

  const renderlist = useCallback(
    ({ item, index }: any) => (
      <VendorCard item={item} index={index} navigation={navigation} />
    ),
    [navigation],
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
          nextPageAvailable
            ? list(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={ListItemSeparator}
      />
    </SafeAreaView>
  );
};

export default ConferenceManthanFeedback;

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
  filterText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  filterContainer: { paddingHorizontal: vw(15) },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(5),
  },
  generateBtn: {
    width: vw(105),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  applyBtn: {
    width: vw(150),
    height: vh(35),
  },
  clearBtn: {
    width: vw(150),
    height: vh(35),
    borderWidth: vw(1),
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    paddingVertical: vh(2),
    paddingHorizontal: vw(14),
    borderRadius: vw(8),
  },

  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
  },
});
