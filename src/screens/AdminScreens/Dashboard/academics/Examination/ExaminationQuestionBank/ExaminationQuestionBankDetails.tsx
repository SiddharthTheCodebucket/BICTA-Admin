import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
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
import {
  FormGradientButton,
  FormWhiteButton,
} from '../../../../../../components/templates';
import { useListAssessmentQuestionBankMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

const stripHtml = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
};

const DetailCell = ({ label, value }: { label: string; value: any }) => (
  <View style={styles.detailCell}>
    <TextAtom style={styles.detailLabel}>{label}</TextAtom>
    <TextAtom style={styles.detailValue}>{value ?? '-'}</TextAtom>
  </View>
);

const ExaminationQuestionBankDetails = (props: Props) => {
  const { navigation } = props;
  const data = props.route?.params?.data;
  const [listQuestionBankQuestionsApi] =
    useListAssessmentQuestionBankMutation();

  const [initialCall, setInitialCall] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [subjectiveQuestions, setSubjectiveQuestions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    listQuestionBankQuestions(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allQuestions = useMemo(
    () => [...mcqQuestions, ...subjectiveQuestions],
    [mcqQuestions, subjectiveQuestions],
  );

  const questionType = mcqQuestions.length > 0 ? 'MCQ' : 'Subjective';

  const listQuestionBankQuestions = (initial: boolean) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: '',
      sort: {
        attributes: ['created_date'],
        sorts: ['desc'],
      },
      filters: [
        ['selectSubjectId', '=', data.selectSubjectId],
        ['selectTopicId', '=', data.selectTopicId],
      ],
      pageNo: 1,
      itemsPerPage: null,
      bipardCentre: [],
    };

    listQuestionBankQuestionsApi(params)
      .unwrap()
      .then((res: any) => {
        const newData = res.data?.data?.[0] ?? {};
        const cleanedMcq = (newData.mcqQuestions ?? []).map((q: any) => ({
          ...q,
          _question: stripHtml(q.question),
        }));
        const cleanedSubj = (newData.subjectiveQuestions ?? []).map(
          (q: any) => ({
            ...q,
            _question: stripHtml(q.question),
          }),
        );

        setMcqQuestions(cleanedMcq);
        setSubjectiveQuestions(cleanedSubj);
        setInitialCall(false);
        setRefreshing(false);
      })
      .catch((err: any) => {
        setInitialCall(false);
        setRefreshing(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const handleDelete = () => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete question bank?',
      message: 'Are you sure you want to delete this question bank?',
      okText: 'Delete',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        Toast.show({ type: 'success', text2: 'Question bank deleted' });
        navigation.goBack();
      },
      cancelFunction: () => {},
    });
  };

  const renderBackTitle = () => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.goBack()}
      style={styles.backTitleRow}
    >
      <Icon name="chevron-left" size={28} color={colors.text_black} />
      <TextAtom style={styles.backTitle}>Question View</TextAtom>
    </TouchableOpacity>
  );

  const renderQuestion = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.questionCard}>
      <View style={styles.questionTextWrap}>
        <TextAtom numberOfLines={2} style={styles.questionText}>
          <TextAtom style={styles.questionPrefix}>Q {index + 1}. </TextAtom>
          {item._question || stripHtml(item.question) || 'I GOT certificate'}
        </TextAtom>
        <TextAtom style={styles.marksText}>Marks - {item.marks ?? 2}</TextAtom>
      </View>
      <View style={styles.questionActions}>
        <TouchableOpacity activeOpacity={0.8} style={styles.iconButton}>
          <SvgDelete width={16} height={16} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.iconButton}
          onPress={() =>
            navigation.navigate(screensName.AddExaminationQuestion, {
              item: data,
            })
          }
        >
          <SvgEditPencile width={16} height={16} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      {renderBackTitle()}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              listQuestionBankQuestions(false);
            }}
          />
        }
      >
        <View style={styles.summaryOuter}>
          <View style={styles.summaryCard}>
            <DetailCell label="Subject" value={data?.selectSubject} />
            <View style={styles.summaryRow}>
              <DetailCell label="Topic" value={data?.selectTopic} />
              <DetailCell
                label="No of Questions"
                value={data?.totalQuestions ?? allQuestions.length}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <TextAtom style={styles.sectionTitle}>Questions</TextAtom>
          <TextAtom style={styles.sectionType}>{questionType}</TextAtom>
        </View>

        <FlatList
          data={allQuestions}
          keyExtractor={(item, index) => `${item?.id ?? 'question'}_${index}`}
          renderItem={renderQuestion}
          scrollEnabled={false}
          ListEmptyComponent={
            initialCall ? null : (
              <TextAtom style={styles.emptyText}>
                {strings.lms.examination.questionBankDetails.noSubjectiveFound}
              </TextAtom>
            )
          }
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <FormWhiteButton
          title="Delete"
          onPress={handleDelete}
          containerStyle={styles.halfButton}
          buttonStyle={styles.bottomButton}
        />
        <FormGradientButton
          title="Edit"
          onPress={() =>
            navigation.navigate(screensName.AddExaminationQuestion, {
              item: data,
            })
          }
          containerStyle={styles.halfButton}
          buttonStyle={styles.bottomButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default ExaminationQuestionBankDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  backTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(14),
    paddingTop: vh(8),
    paddingBottom: vh(6),
  },
  backTitle: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: colors.text_black,
  },
  scrollContent: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(110),
  },
  summaryOuter: {
    borderRadius: vw(12),
    backgroundColor: colors.white,
    padding: vw(8),
  },
  summaryCard: {
    borderRadius: vw(8),
    backgroundColor: colors.new_ui_card_bg,
    paddingHorizontal: vw(8),
    paddingVertical: vh(8),
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: vh(8),
  },
  detailCell: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12),
    color: colors.text_light_grey,
    marginBottom: vh(4),
  },
  detailValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: colors.text_black,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vh(18),
    marginBottom: vh(12),
    paddingHorizontal: vw(4),
  },
  sectionTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: colors.primary_blue,
  },
  sectionType: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(14),
    color: colors.text_light_grey,
  },
  questionCard: {
    minHeight: vh(66),
    borderRadius: vw(8),
    backgroundColor: colors.white,
    paddingHorizontal: vw(16),
    paddingVertical: vh(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionTextWrap: {
    flex: 1,
    paddingRight: vw(12),
  },
  questionText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(15),
    color: colors.text_black,
  },
  questionPrefix: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(15),
    color: colors.primary_blue,
  },
  marksText: {
    marginTop: vh(4),
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(13),
    color: colors.primary_blue,
  },
  questionActions: {
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
  emptyText: {
    textAlign: 'center',
    marginTop: vh(24),
    color: colors.grey,
    fontFamily: fonts.Inter_Medium,
  },
  itemSeparator: {
    height: vh(10),
  },
  bottomBar: {
    position: 'absolute',
    left: vw(12),
    right: vw(12),
    bottom: vh(36),
    flexDirection: 'row',
    gap: vw(10),
  },
  halfButton: {
    flex: 1,
  },
  bottomButton: {
    height: vh(40),
    borderRadius: vw(8),
  },
});
