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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { SvgDelete, SvgEditPencile } from '../../../../../../constants/svgs';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import {
  useExamQuestionOrderRandomizationMutation,
  useListAssessmentTestAssignQuestionMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  navigation: NavigationType;
  route?: any;
}

const InfoBlock = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.infoBlock}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom style={styles.infoValue}>{value ?? '-'}</TextAtom>
  </View>
);

const AssignQuestionList = (props: Props) => {
  const { navigation, route } = props;
  const [listAssignQuestionsApi] =
    useListAssessmentTestAssignQuestionMutation();
  const [randomizeQuestionsApi] = useExamQuestionOrderRandomizationMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [search] = useState('');

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    if (route?.params?.suppressHeader) return;
    Header.setNavigation(
      navigation,
      strings.lms.examination.assignQuestionList.title,
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
      if (firstTimeLoad && search === '') {
        setFirstTimeLoad(false);
        listAssignQuestions(1, true, '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstTimeLoad, search]),
  );

  useEffect(() => {
    listAssignQuestions(1, true, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const listAssignQuestions = (
    pageNumber: number,
    initial: boolean,
    keyword: string,
    filtersArray: any[] = [],
  ) => {
    initial ? setInitialCall(true) : setInitialCall(false);

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

    listAssignQuestionsApi(params)
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

  const randomizeQuestions = (item: any) => {
    if (item.isQuestionOrderRandomized !== 'No') return;

    navigation.navigate(screensName.AlertOrganism, {
      title: strings.lms.examination.assignQuestionList.randomizeQuestionsConf,
      message: strings.lms.examination.assignQuestionList.randomizeQuestionsMsg,
      okText: strings.lms.examination.assignQuestionList.confirm,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        setInitialCall(true);
        randomizeQuestionsApi({ examId: item.id })
          .unwrap()
          .then((res: any) => {
            Toast.show({
              type: 'success',
              text2: res.data?.message?.message,
            });
            setInitialCall(false);
            listAssignQuestions(1, true, search);
          })
          .catch((err: any) => {
            setInitialCall(false);
            Toast.show({
              type: 'error',
              text2: err.data?.message || strings.something_went_wrong_,
            });
          });
      },
      cancelFunction: () => {},
    });
  };

  const handleDelete = (item: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete assigned exam?',
      message: 'Are you sure you want to delete this assigned exam?',
      okText: 'Delete',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        Toast.show({ type: 'success', text2: 'Assigned exam deleted' });
        setData(prev => prev.filter(row => row !== item));
      },
      cancelFunction: () => {},
    });
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <TextAtom style={styles.headerTitle}>
        Assign Exam{' '}
        <TextAtom style={styles.headerCount}>({data?.length ?? 0})</TextAtom>
      </TextAtom>
      <TouchableOpacity activeOpacity={0.8} style={styles.headerIconButton}>
        <Icon name="magnify" size={24} color={colors.text_black} />
      </TouchableOpacity>
    </View>
  );

  const renderAssignQuestionItem = ({ item }: { item: any }) => {
    const randomizationText =
      item.isQuestionOrderRandomized === 'No'
        ? 'Randomize Questions'
        : 'Questions already randomized.';

    return (
      <TouchableAtom style={styles.card} onPress={() => randomizeQuestions(item)}>
        <View style={styles.cardHeader}>
          <TextAtom numberOfLines={1} style={styles.cardTitle}>
            {item.testName ?? 'Test Name here'}
          </TextAtom>
          <View style={styles.actionRow}>
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
                navigation.navigate(screensName.AddAssignExam, {
                  item,
                })
              }
            >
              <SvgEditPencile width={16} height={16} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoRow}>
          <InfoBlock
            label="Topic"
            value={item.selectTopic ?? 'Supervised Learning'}
          />
          <InfoBlock
            label="Question Type"
            value={item.selectQuestionType ?? 'MCQ'}
          />
        </View>

        <TextAtom style={styles.randomLabel}>Question Randomization</TextAtom>
        <TextAtom
          style={[
            styles.randomValue,
            item.isQuestionOrderRandomized === 'No' && styles.randomLink,
          ]}
        >
          {randomizationText}
        </TextAtom>
      </TouchableAtom>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {renderHeader()}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderAssignQuestionItem}
        keyExtractor={(item, index) => `${item?.id ?? 'assign'}_${index}`}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.examination.assignQuestionList.noDataFound}
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
              listAssignQuestions(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listAssignQuestions(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default AssignQuestionList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  headerRow: {
    height: vh(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  headerCount: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },
  headerIconButton: {
    width: vw(34),
    height: vw(34),
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatListContainer: {
    paddingBottom: vh(24),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(16),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: vh(18),
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    paddingRight: vw(12),
  },
  actionRow: {
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
    marginBottom: vh(8),
  },
  infoBlock: {
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
    fontSize: vw(14),
    color: colors.text_black,
  },
  randomLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_light_grey,
    marginBottom: vh(4),
  },
  randomValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  randomLink: {
    color: colors.primary_blue,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: vh(50),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
  paginationLoader: {
    marginTop: vh(15),
  },
  itemSeparator: {
    height: vh(10),
  },
});
