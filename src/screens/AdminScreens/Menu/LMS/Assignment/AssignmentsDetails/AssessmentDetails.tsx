import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  FlatList,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import RenderHTML from 'react-native-render-html';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

import {
  useListAssignmentQuestionBankMutation,
  useListAssignmentResponseMutation,
} from '../../../../../../injectEndpoints/lmsEndpoints';
import moment from 'moment';

interface Props {
  route: any;
  navigation: NavigationType;
}

const AssessmentDetails = (props: Props) => {
  const { navigation } = props;
  const data = props.route?.params?.data;

  const [listAssignmentResponseApi] = useListAssignmentResponseMutation();

  const [initialCall, setInitialCall] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState<any[]>([]);
  const [subjectiveQuestions, setSubjectiveQuestions] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Assignment Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    listAssignmentQuestionBank(1, true);
  }, []);

  const stripHtml = (s?: string) => {
    if (!s) return '';
    return s
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  const listAssignmentQuestionBank = (pageNumber: number, initial: boolean) => {
    initial ? setInitialCall(true) : setInitialCall(false);

    const params: any = {
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [],
      pageNo: 1,
      itemsPerPage: null,
      bipardCentre: [],
      submissionId: data.submissionId,
    };
    listAssignmentResponseApi(params)
      .unwrap()
      .then((res: any) => {
        setInitialCall(false);

        const newData = res.data?.user?.[0] ?? {};

        const mcqData = newData.assignment?.mcq;
        let mcqMapped: any[] = [];

        if (
          mcqData &&
          Array.isArray(mcqData.mcqQuestion) &&
          mcqData.mcqQuestion.length > 0
        ) {
          mcqMapped = mcqData.mcqQuestion.map((q: any, i: number) => ({
            question: q,
            option1: mcqData.mcqResponseText?.[i]?.option1,
            option2: mcqData.mcqResponseText?.[i]?.option2,
            option3: mcqData.mcqResponseText?.[i]?.option3,
            option4: mcqData.mcqResponseText?.[i]?.option4,
            correctAnswer: mcqData.mcqResponseId?.[i],
            marks: 1,
          }));
        }

        setMcqQuestions(mcqMapped);
        const subjData = newData.assignment?.subjective;
        let subjectiveMapped: any[] = [];

        if (subjData && subjData.subjectiveQuestion?.length > 0) {
          subjectiveMapped = subjData.subjectiveQuestion.map(
            (q: any, i: number) => ({
              question: q,
              subjectiveResponse: subjData.subjectiveResponse?.[i] ?? '',
              uploadedResponseFile: subjData.uploadedResponseFile?.[i] ?? null,
              marks: subjData.subjectiveTotalMarks?.[i] ?? 0,
            }),
          );
        }

        setSubjectiveQuestions(subjectiveMapped);
      })
      .catch((err: any) => {
        setInitialCall(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || 'Something went wrong',
        });
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    listAssignmentQuestionBank(1, false);
    setTimeout(() => setRefreshing(false), 600);
  };

  const renderMCQItem = ({ item, index }: { item: any; index: number }) => {
    const correct = item.correctAnswer; // e.g. "option_2"
    const correctOptionKey = correct?.replace('option_', 'option'); // "option2" not used but kept
    // Map correctAnswer to option text easily:
    const optionMap: Record<string, string> = {
      option_1: item._option1 ?? item.option1 ?? '',
      option_2: item._option2 ?? item.option2 ?? '',
      option_3: item._option3 ?? item.option3 ?? '',
      option_4: item._option4 ?? item.option4 ?? '',
    };

    return (
      <View style={[styles.card, { marginBottom: vh(12) }]}>
        <View style={styles.rowBetween}>
          <TextAtom
            numberOfLines={0}
            style={[styles.label, { width: vw(240) }]}
          >
            {index + 1}. {item._question || stripHtml(item.question)}
          </TextAtom>
          <TextAtom style={styles.labelRight}>{item.marks} Marks</TextAtom>
        </View>

        <View style={{ marginTop: vh(8) }}>
          {['option_1', 'option_2', 'option_3', 'option_4'].map(
            (optKey: string, idx: number) => {
              const optText = optionMap[optKey] ?? '';
              const isCorrect = item.correctAnswer === optKey;
              return (
                <View key={optKey} style={styles.optionRow}>
                  <View style={styles.radioRow}>
                    <View
                      style={[
                        styles.radioOuter,
                        isCorrect && styles.radioOuterActive,
                      ]}
                    >
                      {isCorrect && <View style={styles.radioInner} />}
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

  const renderSubjectiveItem = ({ item, index }: any) => {
    const width = vw(330);

    const questionText = item.question || item._question;
    const answerText = item.subjectiveResponse;
    const fileUrl = item.uploadedResponseFile;

    return (
      <View style={[styles.card, { marginBottom: vh(12) }]}>
        {/* Question + Marks */}
        <View style={styles.rowBetween}>
          <TextAtom
            numberOfLines={0}
            style={[styles.label, { width: vw(240) }]}
          >
            {index + 1}. {stripHtml(questionText)}
          </TextAtom>
          <TextAtom style={styles.labelRight}>{item.marks} Marks</TextAtom>
        </View>

        {/* ANSWER Heading */}
        <TextAtom
          style={{
            marginTop: vh(10),
            fontFamily: fonts.Roboto_Medium,
            fontSize: vw(14),
            color: colors.black,
          }}
        >
          Ans:
        </TextAtom>

        {/* Render HTML Answer */}
        {answerText ? (
          <RenderHTML
            contentWidth={width}
            source={{ html: answerText }}
            tagsStyles={{
              p: { fontSize: vw(13), color: colors.grey },
              li: { fontSize: vw(13), color: colors.grey },
              strong: { color: colors.black },
            }}
          />
        ) : null}

        {/* File Button */}
        {fileUrl ? (
          <TouchableOpacity
            onPress={() => Linking.openURL(fileUrl)}
            style={{
              marginTop: vh(10),
              backgroundColor: colors.primary,
              paddingVertical: vh(8),
              paddingHorizontal: vw(12),
              borderRadius: vw(6),
              alignSelf: 'flex-start',
            }}
          >
            <TextAtom
              style={{ color: colors.white, fontFamily: fonts.Roboto_Medium }}
            >
              OPEN FILE
            </TextAtom>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={initialCall} />
      <View style={[styles.card, { marginBottom: vh(0), marginTop: vh(10) }]}>
        <TextAtom style={styles.value}>
          Assignment Name: {data?.assignmentName ?? '-'}
        </TextAtom>
        <TextAtom style={styles.value}>
          Trainee Name / Group Name: {data?.traineeName ?? '-'}
        </TextAtom>
        <TextAtom style={styles.value}>
          Availability:
          {moment(data?.submissionLastDate, 'YYYY-MM-DD')
            ? moment(data.submissionLastDate).format('DD-MM-YYYY')
            : '-'}
        </TextAtom>

        <TextAtom style={styles.value}>
          Submitted On:
          {moment(data?.submitOn, 'YYYY-MM-DD')
            ? moment(data.submitOn).format('DD-MM-YYYY')
            : '-'}
        </TextAtom>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.flatListContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header info */}

        {mcqQuestions.length >= 1 && (
          <>
            <TextAtom style={[styles.sectionHeading, { marginLeft: vw(15) }]}>
              MCQ
            </TextAtom>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={mcqQuestions}
              keyExtractor={(_, i) => `mcq_${i}`}
              renderItem={renderMCQItem}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: vh(8) }}
            />
          </>
        )}
        {subjectiveQuestions.length >= 1 && (
          <>
            <TextAtom
              style={[
                styles.sectionHeading,
                { marginLeft: vw(15), marginTop: vh(10) },
              ]}
            >
              Subjective
            </TextAtom>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={subjectiveQuestions}
              keyExtractor={(_, i) => `subj_${i}`}
              renderItem={renderSubjectiveItem}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: vh(24) }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AssessmentDetails;

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
});
