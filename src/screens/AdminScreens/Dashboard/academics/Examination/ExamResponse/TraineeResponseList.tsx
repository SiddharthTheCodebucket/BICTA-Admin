import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { SvgEye } from '../../../../../../constants/svgs';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { FormGradientButton } from '../../../../../../components/templates';
import {
  useListExaminationSubmissionAnswerMutation,
  useListExaminationSubmissionReportMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';

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

const Badge = ({
  value,
  type,
}: {
  value: any;
  type: 'danger' | 'info';
}) => (
  <View style={[styles.badge, type === 'danger' ? styles.failBadge : styles.infoBadge]}>
    <TextAtom
      style={[
        styles.badgeText,
        type === 'danger' ? styles.failBadgeText : styles.infoBadgeText,
      ]}
    >
      {value ?? '-'}
    </TextAtom>
  </View>
);

const stripHtml = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

const TraineeResponseList = (props: Props) => {
  const { navigation } = props;
  const exam = props.route?.params?.data;
  const [listTraineeResponsesApi] =
    useListExaminationSubmissionReportMutation();
  const [listExamResponsesApi] = useListExaminationSubmissionAnswerMutation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [nextPageAvailable, setNextPageAvailable] = useState(false);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true);
  const [pagination, setPagination] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialCall, setInitialCall] = useState(false);
  const [search] = useState('');
  const [url, setUrl] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);

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
      if (firstTimeLoad && search === '') {
        setFirstTimeLoad(false);
        listTraineeResponses(1, true, '');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstTimeLoad, search]),
  );

  useEffect(() => {
    if (!exam?.id) return;
    listTraineeResponses(1, true, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.id]);

  const listTraineeResponses = (
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
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [
        ...(exam?.id ? [['testId', '=', exam.testId ?? exam.id]] : []),
        ...filtersArray,
      ],
      pageNo: pageNumber,
      itemsPerPage: ITEMS_PER_PAGE,
      bipardCentre: [],
      exportFlag: true,
      ...extraParams,
    };

    listTraineeResponsesApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.user ?? [];
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
        setUrl(res.data?.exportUrl ?? '');
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

  const openResponseSheet = (item: any) => {
    setSelectedTrainee(item);
    setResponses([]);
    setSheetLoading(true);

    const params: any = {
      traineeId: item.traineeId,
      submissionId: item.id,
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: 1,
      itemsPerPage: 10,
    };

    listExamResponsesApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.user?.[0]?.response ?? [];
        setResponses(newData);
        setSheetLoading(false);
      })
      .catch((err: any) => {
        setSheetLoading(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const closeResponseSheet = () => {
    setSelectedTrainee(null);
    setResponses([]);
  };

  const renderBackTitle = () => (
    <View style={styles.titleRow}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
        style={styles.backTitleRow}
      >
        <Icon name="chevron-left" size={28} color={colors.text_black} />
        <TextAtom style={styles.backTitle}>Exam Result Details List</TextAtom>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} style={styles.searchButton}>
        <Icon name="magnify" size={24} color={colors.text_black} />
      </TouchableOpacity>
    </View>
  );

  const renderTraineeResponseItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TextAtom numberOfLines={1} style={styles.cardTitle}>
          {item.trainingName ?? 'Training Name here'}
        </TextAtom>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={() => openResponseSheet(item)}
        >
          <SvgEye width={16} height={16} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoGrid}>
        <InfoBlock label="Trainee Name" value={item.traineeName ?? 'ashutosh kumar'} />
        <InfoBlock label="Trainee Email" value={item.traineeEmail ?? 'anshu@example.com'} />
        <InfoBlock label="Trainee Batch No" value={item.batchNo ?? item.batchName ?? 5} />
        <InfoBlock label="Attempt" value={item.attempt ?? 1} />
        <InfoBlock label="Total Questions" value={item.totalQuestions ?? 30} />
        <InfoBlock label="Total Marks" value={item.totalMarks ?? 30} />
        <InfoBlock label="Passing Marks" value={item.passingMarks ?? 15} />
        <InfoBlock label="Obtained Marks" value={item.totalObtainedMarks ?? 8} />
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBlock}>
          <TextAtom style={styles.infoLabel}>Status</TextAtom>
          <Badge value={item.passingStatus ?? 'Fail'} type="danger" />
        </View>
        <View style={styles.infoBlock}>
          <TextAtom style={styles.infoLabel}>Final Submission</TextAtom>
          <Badge value={item.finalSubmission ?? 'Yes'} type="info" />
        </View>
      </View>
    </View>
  );

  const renderResponseItem = ({ item }: { item: any }) => (
    <View style={styles.responseCard}>
      <TextAtom numberOfLines={2} style={styles.responseQuestion}>
        {stripHtml(item.mcqQuestion) || 'Question Name here'}
      </TextAtom>
      <View style={styles.responseInfoRow}>
        <InfoBlock label="Answer" value={item.mcqResponse ?? 'Option 2'} />
        <InfoBlock label="Correct Answer" value={item.correctOption ?? 'Option 3'} />
      </View>
    </View>
  );

  const renderResponseSheet = () => (
    <Modal
      transparent
      visible={!!selectedTrainee}
      animationType="slide"
      onRequestClose={closeResponseSheet}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <TextAtom style={styles.sheetTitle}>Trainee Questions Result</TextAtom>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={closeResponseSheet}
              style={styles.closeButton}
            >
              <Icon name="close" size={28} color={colors.text_black} />
            </TouchableOpacity>
          </View>

          <FullscreenLoading isVisible={sheetLoading} />
          <FlatList
            data={responses}
            keyExtractor={(item, index) => `${item?.id ?? 'response'}_${index}`}
            renderItem={renderResponseItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.responseList}
            ListEmptyComponent={
              sheetLoading ? null : (
                <TextAtom style={styles.emptyText}>No responses found</TextAtom>
              )
            }
            ItemSeparatorComponent={() => <View style={styles.responseGap} />}
          />

          <FormGradientButton
            title="Download"
            onPress={() => {
              if (url) {
                downloadAndOpenFile(url);
              }
            }}
            buttonStyle={styles.downloadButton}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {renderBackTitle()}

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderTraineeResponseItem}
        keyExtractor={(item, index) => `${item?.id ?? 'trainee'}_${index}`}
        ListEmptyComponent={
          initialCall ? null : (
            <TextAtom style={styles.emptyText}>
              {strings.lms.examination.traineeResponseList.noDataFound}
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
              listTraineeResponses(1, false, search);
            }}
          />
        }
        onEndReached={() => {
          setPagination(true);
          nextPageAvailable
            ? listTraineeResponses(page + 1, false, search)
            : setPagination(false);
        }}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      {renderResponseSheet()}
    </SafeAreaView>
  );
};

export default TraineeResponseList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
    paddingHorizontal: vw(16),
  },
  titleRow: {
    height: vh(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  searchButton: {
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
  iconButton: {
    width: vw(30),
    height: vw(30),
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
    marginBottom: vh(5),
  },
  infoValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: vw(4),
    paddingHorizontal: vw(5),
    paddingVertical: vh(4),
  },
  failBadge: {
    backgroundColor: '#FFE4E6',
  },
  infoBadge: {
    backgroundColor: '#E6F2FF',
  },
  badgeText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
  },
  failBadgeText: {
    color: colors.red,
  },
  infoBadgeText: {
    color: colors.primary_blue,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(14, 34, 57, 0.08)',
  },
  sheet: {
    maxHeight: '78%',
    minHeight: '72%',
    borderTopLeftRadius: vw(28),
    borderTopRightRadius: vw(28),
    backgroundColor: colors.white,
    paddingHorizontal: vw(15),
    paddingTop: vh(10),
    paddingBottom: vh(40),
  },
  sheetHandle: {
    width: vw(90),
    height: vh(5),
    borderRadius: vw(4),
    backgroundColor: colors.text_grey,
    alignSelf: 'center',
    marginBottom: vh(26),
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vh(18),
  },
  sheetTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.new_ui_heading,
  },
  closeButton: {
    width: vw(36),
    height: vw(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseList: {
    paddingBottom: vh(18),
  },
  responseCard: {
    borderRadius: vw(8),
    backgroundColor: colors.new_ui_card_bg,
    paddingHorizontal: vw(15),
    paddingVertical: vh(15),
  },
  responseQuestion: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.text_black,
    marginBottom: vh(18),
  },
  responseInfoRow: {
    flexDirection: 'row',
  },
  responseGap: {
    height: vh(14),
  },
  downloadButton: {
    height: vh(40),
    borderRadius: vw(8),
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
