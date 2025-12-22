import React, { useLayoutEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';

interface Props {
  route: any;
  navigation: NavigationType;
}

const ExamResponseDetailsListTrainee = (props: Props) => {
  const { navigation } = props;
  const data = props.route.params?.data;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.examination.examResponseDetails.title,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.trainingName}
            value={data.trainingName}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.traineeName}
            value={data.traineeName}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.traineeEmail}
            value={data.traineeEmail}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.traineeBatchNo}
            value={data.batchNo}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.examName}
            value={data.testName}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.attempt}
            value={data.attempt}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.totalQuestions}
            value={data.totalQuestions}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.totalMarks}
            value={data.totalMarks}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.passingMarks}
            value={data.passingMarks}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.obtainedMarks}
            value={data.totalObtainedMarks}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.status}
            value={data.passingStatus}
          />
          <TraineeDetailRow
            label={strings.lms.examination.examResponseDetails.finalSubmission}
            value={data.finalSubmission}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const TraineeDetailRow = ({ label, value }: any) => (
  <View style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value}>{value || '-'}</TextAtom>
  </View>
);

export default ExamResponseDetailsListTrainee;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    paddingTop: vh(10),
  },
  scrollContent: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(20),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    padding: vw(15),
    elevation: 2,
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
  },
  row: { marginBottom: vh(10) },
});
