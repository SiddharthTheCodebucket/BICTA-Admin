import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
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
  vh,
  vw,
} from '../../../../../../constants';
import { SvgDelete, SvgEye } from '../../../../../../constants/svgs';
import { useAppSelector } from '../../../../../../hooks';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { FormSearch } from '../../../../../../components/templates';
import { useListAssessmentQuestionBankMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import ExaminationListHeader from '../components/ExaminationListHeader';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const QuestionInfo = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.infoColumn}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom style={styles.infoValue}>{value ?? '-'}</TextAtom>
  </View>
);

const ExaminationQuestionBank = (props: Props) => {
  const { navigation, route } = props;
  const { crediantialData } = useAppSelector(state => state.Auth);
  const [listQuestionBankApi] = useListAssessmentQuestionBankMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [centerSerach, setCenterSerach] = useState<any>({});

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    if (route?.params?.suppressHeader) return;
    Header.setNavigation(
      navigation,
      strings.lms.examination.questionBank.title,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation, route?.params?.suppressHeader]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad && !centerSerach?.name && search === '') {
        setFirstTimeLoad(false);
        listQuestionBank(1, true, '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstTimeLoad, centerSerach, search]),
  );

  useEffect(() => {
    if (!centerSerach?.name) return;
    listQuestionBank(1, true, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerSerach]);

  const getCentreFilter = () => {
    if (!centerSerach?.name) return null;

    if (centerSerach.name === strings.dashboardIndex.allCenters) {
      return [strings.dashboardIndex.gaya, strings.dashboardIndex.patna];
    }

    return [centerSerach.name];
  };

  const listQuestionBank = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const centreFilter = getCentreFilter();
    const params: any = {
      search: keyword,
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: filtersArray,
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
    };

    if (centreFilter) {
      params.bipardCentre = centreFilter;
    }

    listQuestionBankApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data ?? [];
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);

        if (pageNumber !== 1 && data.length > 0) {
          setData(prev => [...prev, ...newData]);
        } else {
          setData(newData);
        }

        setPage(pageNumber);
        setNextPageAvailable(
          pageNumber * ITEMS_PER_PAGE < (res?.data?.totalCount ?? 0),
        );
      })
      .catch((err: any) => {
        setInitialCall(false);
        setPagination(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const onChangeSearch = (text: string) => {
    setSearch(text);
    listQuestionBank(1, true, text);
  };

  const onClearSearch = () => {
    setSearch('');
    listQuestionBank(1, true, '');
  };

  const handleDelete = (item: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete question bank?',
      message: 'Are you sure you want to delete this question bank?',
      okText: 'Delete',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        Toast.show({ type: 'success', text2: 'Question bank deleted' });
        setData(prev => prev.filter(row => row !== item));
      },
      cancelFunction: () => {},
    });
  };

  const QuestionBankCard = ({ item }: { item: any }) => (
    <TouchableAtom
      style={styles.card}
      onPress={() =>
        navigation.navigate(screensName.ExaminationQuestionBankDetails, {
          data: item,
        })
      }
    >
      <View style={styles.cardHeader}>
        <TextAtom numberOfLines={1} style={styles.cardTitle}>
          {item.selectSubject ?? 'Subject Name here'}
        </TextAtom>
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={() => handleDelete(item)}
          >
            <SvgDelete width={16} height={16} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate(screensName.ExaminationQuestionBankDetails, {
                data: item,
              })
            }
          >
            <SvgEye width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoRow}>
        <QuestionInfo label="Topic" value={item.selectTopic ?? 'DBMS'} />
        <QuestionInfo
          label="No. of Questions"
          value={item.totalQuestions ?? 3}
        />
      </View>
    </TouchableAtom>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <ExaminationListHeader
        title="Question"
        count={data?.length ?? 0}
        onPressSearch={() => setShowSearch(prev => !prev)}
        onPressCreate={() =>
          navigation.navigate(screensName.AddExaminationQuestion)
        }
      />

      {showSearch && (
        <FormSearch
          value={search}
          onChangeText={onChangeSearch}
          onClear={onClearSearch}
          containerStyle={styles.searchBox}
        />
      )}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={({ item }) => <QuestionBankCard item={item} />}
        keyExtractor={(item, index) => `${item?.id ?? 'question'}_${index}`}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.examination.questionBank.noDataFound}
            </TextAtom>
          )
        }
        ListFooterComponent={
          <ActivityIndicator
            size={'small'}
            color={colors.primary}
            animating={pagination}
            style={styles.paginationLoader}
          />
        }
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listQuestionBank(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listQuestionBank(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default ExaminationQuestionBank;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  flatListContainer: {
    paddingTop: vh(12),
    paddingBottom: vh(24),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(16),
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(20),
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    paddingRight: vw(10),
  },
  actions: {
    flexDirection: 'row',
    gap: vw(10),
  },
  iconButton: {
    width: vw(32),
    height: vw(32),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: '#E6E9EF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_light_grey,
    marginBottom: vh(6),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(15),
    color: colors.text_black,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
  searchBox: {
    marginHorizontal: 0,
  },
  centerDropdown: {
    marginBottom: vh(-10),
    marginTop: vh(8),
  },
  paginationLoader: {
    marginTop: vh(15),
  },
  itemSeparator: {
    height: vh(10),
  },
});
