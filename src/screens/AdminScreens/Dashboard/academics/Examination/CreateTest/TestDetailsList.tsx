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
import moment from 'moment';
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
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useListAssessmentCreateTestMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const InfoBlock = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.infoBlock}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom style={styles.infoValue}>{value ?? '-'}</TextAtom>
  </View>
);

const StatusPills = ({ status }: { status?: string }) => {
  const active = status === 'Active';
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusPill, active && styles.statusPillActive]}>
        <TextAtom
          style={[
            styles.statusText,
            active && styles.statusTextActive,
          ]}
        >
          Active
        </TextAtom>
      </View>
      <View style={[styles.statusPill, !active && styles.statusPillActive]}>
        <TextAtom
          style={[
            styles.statusText,
            !active && styles.statusTextActive,
          ]}
        >
          Inactive
        </TextAtom>
      </View>
    </View>
  );
};

const TestDetailsList = (props: Props) => {
  const { navigation } = props;
  const training = props.route?.params?.item;
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [listAssessmentAssignmentApi] = useListAssessmentCreateTestMutation();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.examinationIndex.title,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeLoad) {
        setFirstTimeLoad(false);
        listTestDetails(1, true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstTimeLoad]),
  );

  useEffect(() => {
    if (!training?.id) return;
    listTestDetails(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [training?.id]);

  const listTestDetails = (pageNumber: number, initial: boolean) => {
    initial ? setInitialCall(true) : setInitialCall(false);
    const params: any = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: training?.id ? ['trainingNameId', '=', training.id] : [],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
    };

    listAssessmentAssignmentApi(params)
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

  const formatDate = (value: any) => {
    if (!value) return '-';
    return moment(value, 'YYYY-MM-DD').isValid()
      ? moment(value, 'YYYY-MM-DD').format('DD/MM/YYYY')
      : '-';
  };

  const getTimeDifference = (start: any, end: any) => {
    if (!start || !end) return '1 hours';
    const startMoment = moment(start, 'HH:mm:ss');
    const endMoment = moment(end, 'HH:mm:ss');
    if (!startMoment.isValid() || !endMoment.isValid()) return '1 hours';
    const diff = moment.duration(endMoment.diff(startMoment));
    const hours = diff.hours();
    const minutes = diff.minutes();
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours || 1} hours`;
  };

  const handleDelete = (item: any) => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete exam?',
      message: 'Are you sure you want to delete this exam?',
      okText: 'Delete',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        Toast.show({ type: 'success', text2: 'Exam deleted' });
        setData(prev => prev.filter(row => row !== item));
      },
      cancelFunction: () => {},
    });
  };

  const renderBackTitle = () => (
    <View style={styles.titleRow}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
        style={styles.backTitleRow}
      >
        <Icon name="chevron-left" size={28} color={colors.text_black} />
        <TextAtom style={styles.backTitle}>
          Create Exam <TextAtom style={styles.countText}>({data.length})</TextAtom>
        </TextAtom>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} style={styles.searchButton}>
        <Icon name="magnify" size={24} color={colors.text_black} />
      </TouchableOpacity>
    </View>
  );

  const renderTrainingCard = () => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.trainingCard}
      onPress={() => setTrainingOpen(prev => !prev)}
    >
      <View>
        <TextAtom numberOfLines={1} style={styles.trainingTitle}>
          {training?.name ?? 'Training Gaya For Chat APP'}
        </TextAtom>
        <TextAtom style={styles.trainingSubtitle}>
          {training?.noOfBatch ?? training?.noOfBatches ?? 10} Batch
        </TextAtom>
      </View>
      <Icon
        name={trainingOpen ? 'chevron-up' : 'chevron-down'}
        size={26}
        color={colors.text_black}
      />
    </TouchableOpacity>
  );

  const renderTestDetailItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TextAtom numberOfLines={2} style={styles.cardTitle}>
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
              navigation.navigate(screensName.AddCreateExam, {
                item,
                training,
              })
            }
          >
            <SvgEditPencile width={16} height={16} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <InfoBlock label="No. of Questions" value={item.noOfQuestions ?? 30} />
        <InfoBlock label="Test Type" value={item.typeOfTest ?? 'Assessment'} />
        <InfoBlock label="Test Start Date" value={formatDate(item.quizStartDate)} />
        <InfoBlock label="Test End Date" value={formatDate(item.quizEndDate)} />
        <InfoBlock
          label="Time Limit"
          value={getTimeDifference(item.testStartTime, item.testEndTime)}
        />
        <InfoBlock label="Negative Marking" value={item.negativeMarking ?? 'No'} />
      </View>

      <View style={styles.cardFooter}>
        <View>
          <TextAtom style={styles.infoLabel}>Status</TextAtom>
          <StatusPills status={item.status ?? 'Inactive'} />
        </View>
        <TouchableAtom
          style={styles.assignButton}
          onPress={() => navigation.navigate(screensName.AssignQuestionList)}
        >
          <TextAtom style={styles.assignText}>Assign</TextAtom>
        </TouchableAtom>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {renderBackTitle()}
      {renderTrainingCard()}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTestDetailItem}
        keyExtractor={(item, index) => `${item?.id ?? 'exam'}_${index}`}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.examination.testDetailsList.noDataFound}
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
              listTestDetails(1, false);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTestDetails(page + 1, false)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default TestDetailsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: vh(8),
    marginBottom: vh(8),
  },
  backTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  countText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.new_ui_count,
  },
  searchButton: {
    width: vw(36),
    height: vw(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainingCard: {
    minHeight: vh(64),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.new_ui_card_border,
    paddingHorizontal: vw(14),
    paddingVertical: vh(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },
  trainingTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
    maxWidth: vw(280),
  },
  trainingSubtitle: {
    marginTop: vh(5),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.new_ui_card_description,
  },
  flatListContainer: {
    paddingBottom: vh(24),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    paddingHorizontal: vw(14),
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoBlock: {
    width: '50%',
    marginBottom: vh(10),
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_light_grey,
    marginBottom: vh(4),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusPill: {
    height: vh(23),
    paddingHorizontal: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: vw(3),
  },
  statusPillActive: {
    backgroundColor: colors.primary_blue,
  },
  statusText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(11),
    color: colors.text_black,
  },
  statusTextActive: {
    color: colors.white,
  },
  assignButton: {
    width: vw(108),
    height: vh(36),
    borderRadius: vw(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F8FC',
  },
  assignText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
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
