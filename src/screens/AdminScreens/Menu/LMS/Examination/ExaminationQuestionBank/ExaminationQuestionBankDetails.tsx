import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

import { useListAssessmentQuestionBankMutation } from '../../../../../../injectEndpoints/lmsEndpoints';

interface Props {
  route: any;
  navigation: NavigationType;
}

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
      strings.lms.examination.questionBankDetails.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    listQuestionBankQuestions(1, true);
  }, []);

  const stripHtml = (s?: string) => {
    if (!s) return '';
    return s
      .replaceAll(/<[^>]*>/g, '')
      .replaceAll(/&nbsp;/, ' ')
      .trim();
  };

  const listQuestionBankQuestions = (pageNumber: number, initial: boolean) => {
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
        setInitialCall(false);
        const newData = res.data?.data?.[0] ?? {};
        const mcq = newData.mcqQuestions ?? [];
        const subj = newData.subjectiveQuestions ?? [];

        // Ensure options are cleaned of HTML tags before rendering
        const cleanedMcq = mcq.map((q: any) => ({
          ...q,
          _question: stripHtml(q.question),
          _option1: stripHtml(q.option1),
          _option2: stripHtml(q.option2),
          _option3: stripHtml(q.option3),
          _option4: stripHtml(q.option4),
        }));

        const cleanedSubj = subj.map((s: any) => ({
          ...s,
          _question: stripHtml(s.question),
        }));

        setMcqQuestions(cleanedMcq);
        setSubjectiveQuestions(cleanedSubj);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    listQuestionBankQuestions(1, false);
    setTimeout(() => setRefreshing(false), 600);
  };

  const renderMCQItem = ({ item, index }: { item: any; index: number }) => {
    const isCorrect = (optKey: string) => item.correctAnswer === optKey;
    const optionMap: Record<string, string> = {
      option_1: item._option1 ?? item.option1 ?? '',
      option_2: item._option2 ?? item.option2 ?? '',
      option_3: item._option3 ?? item.option3 ?? '',
      option_4: item._option4 ?? item.option4 ?? '',
    };

    return (
      <View style={styles.mcqCard}>
        <View style={styles.rowBetween}>
          <TextAtom numberOfLines={0} style={styles.questionText}>
            {index + 1}. {item._question || stripHtml(item.question)}
          </TextAtom>
          <TextAtom style={styles.labelRight}>
            {item.marks} {strings.lms.examination.questionBankDetails.marks}
          </TextAtom>
        </View>

        <View style={styles.optionsContainer}>
          {['option_1', 'option_2', 'option_3', 'option_4'].map(
            (optKey: string) => {
              const optText = optionMap[optKey] ?? '';
              const correct = isCorrect(optKey);
              return (
                <View key={optKey} style={styles.optionRow}>
                  <View style={styles.radioRow}>
                    <View
                      style={[
                        styles.radioOuter,
                        correct && styles.radioOuterActive,
                      ]}
                    >
                      {correct && <View style={styles.radioInner} />}
                    </View>
                    <TextAtom numberOfLines={0} style={styles.value}>
                      {optText}
                    </TextAtom>
                  </View>
                </View>
              );
            },
          )}
        </View>
      </View>
    );
  };

  const renderSubjectiveItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    return (
      <View style={styles.subjectiveCard}>
        <View style={styles.rowBetween}>
          <TextAtom numberOfLines={0} style={styles.questionText}>
            {index + 1}. {item._question || stripHtml(item.question)}
          </TextAtom>
          <TextAtom style={styles.labelRight}>
            {item.marks} {strings.lms.examination.questionBankDetails.marks}
          </TextAtom>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.flex1}
        contentContainerStyle={styles.flatListContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerCard}>
          <TextAtom style={styles.value}>
            {strings.lms.examination.questionBankDetails.subject}{' '}
            {data?.selectSubject ?? '-'}
          </TextAtom>
          <TextAtom style={styles.value}>
            {strings.lms.examination.questionBankDetails.topic}{' '}
            {data?.selectTopic ?? '-'}
          </TextAtom>
        </View>

        <TextAtom style={styles.sectionHeading}>
          {strings.lms.examination.questionBankDetails.mcq}
        </TextAtom>

        {mcqQuestions.length === 0 ? (
          <TextAtom style={styles.emptyText}>
            {strings.lms.examination.questionBankDetails.noMcqFound}
          </TextAtom>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={mcqQuestions}
            keyExtractor={(_, i) => `mcq_${i}`}
            renderItem={renderMCQItem}
            scrollEnabled={false}
            contentContainerStyle={styles.mcqList}
          />
        )}

        <TextAtom style={styles.sectionHeadingSubj}>
          {strings.lms.examination.questionBankDetails.subjective}
        </TextAtom>

        {subjectiveQuestions.length === 0 ? (
          <TextAtom style={styles.emptyText}>
            {strings.lms.examination.questionBankDetails.noSubjectiveFound}
          </TextAtom>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={subjectiveQuestions}
            keyExtractor={(_, i) => `subj_${i}`}
            renderItem={renderSubjectiveItem}
            scrollEnabled={false}
            contentContainerStyle={styles.subjList}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExaminationQuestionBankDetails;

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
    marginTop: vh(20),
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeading: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.black,
    marginVertical: vh(6),
    marginLeft: vw(15),
  },
  optionRow: {
    marginBottom: vh(8),
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: vw(22),
    height: vw(22),
    borderRadius: vw(11),
    borderWidth: 2,
    borderColor: colors.chinese_silver,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: vw(12),
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: vw(10),
    height: vw(10),
    borderRadius: vw(5),
    backgroundColor: colors.primary,
  },
  flex1: { flex: 1 },
  headerCard: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: vh(0),
  },
  mcqCard: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: vh(12),
  },
  questionText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    width: vw(240),
  },
  optionsContainer: { marginTop: vh(8) },
  subjectiveCard: {
    backgroundColor: colors.white,
    marginHorizontal: vw(15),
    borderRadius: vw(8),
    paddingHorizontal: vw(15),
    paddingVertical: vh(8),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: vh(12),
  },
  mcqList: { paddingBottom: vh(8) },
  sectionHeadingSubj: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(16),
    color: colors.black,
    marginVertical: vh(6),
    marginLeft: vw(15),
    marginTop: vh(10),
  },
  subjList: { paddingBottom: vh(24) },
});
