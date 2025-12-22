import React, { useEffect, useLayoutEffect, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { useListExaminationSubmissionAnswerMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import Toast from 'react-native-toast-message';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

interface Props {
  route: any;
  navigation: NavigationType;
}

const ExamResponseSheet = (props: Props) => {
  const { navigation } = props;
  const item = props.route.params?.item || {};
  const { width } = useWindowDimensions();

  const [listExamResponsesApi] = useListExaminationSubmissionAnswerMutation();

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.examResponseSheet.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const [laoder, setLoader] = useState(false);
  const [response, setResponse] = useState<any>([]);

  useEffect(() => {
    listExamResponses();
  }, []);

  const listExamResponses = () => {
    setLoader(true);

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
        const newData = res.data?.user[0] ?? [];
        setResponse(newData.response);
        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong_,
        });
      });
  };

  const renderItem = ({ item, index }: any) => {
    const selectedOptionKey = item.mcqResponse;
    const selectedAnswer = selectedOptionKey ?? 'N/A';
    const correctAnswer = item.correctOption;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <TextAtom style={styles.qIndex}>Q{index + 1}.</TextAtom>
          <View style={styles.flex1}>
            <RenderHtml
              contentWidth={width - vw(40)}
              source={{ html: item.mcqQuestion }}
            />
          </View>
        </View>

        <View style={styles.answerBlock}>
          <TextAtom style={styles.label}>
            {strings.lms.examination.examResponseSheet.selectedAnswer}{' '}
          </TextAtom>
          <TextAtom
            style={[
              styles.value,
              { color: selectedAnswer === 'N/A' ? colors.grey : colors.black },
            ]}
          >
            {selectedAnswer}
          </TextAtom>
        </View>

        <View style={styles.answerBlock}>
          <TextAtom style={styles.label}>
            {strings.lms.examination.examResponseSheet.correctAnswer}{' '}
          </TextAtom>
          <TextAtom style={[styles.value, { color: colors.green }]}>
            {correctAnswer}
          </TextAtom>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={laoder} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={response}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <TextAtom style={styles.emptyText}>
            {strings.lms.examination.examResponseSheet.noResponsesFound}
          </TextAtom>
        }
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </SafeAreaView>
  );
};

export default ExamResponseSheet;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
  listContainer: {
    paddingVertical: vh(10),
    paddingHorizontal: vw(10),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(8),
    marginBottom: vh(10),
    paddingHorizontal: vw(15),
    paddingVertical: vh(10),
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  qIndex: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginRight: vw(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  answerBlock: {
    marginTop: vh(5),
    flexDirection: 'row',
  },
  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.black,
  },
  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
  },
  statusContainer: {
    marginTop: vh(8),
    alignItems: 'flex-end',
  },
  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
  },
  emptyText: {
    textAlign: 'center',
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
    marginTop: vh(50),
  },
  flex1: { flex: 1 },
  itemSeparator: { height: vh(10) },
});
