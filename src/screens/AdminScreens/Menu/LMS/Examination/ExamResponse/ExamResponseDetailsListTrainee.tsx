import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import { colors, fonts, vh, vw } from '../../../../../../constants';
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
  const data = props.route.params?.data; // <-- single object

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Exam Response Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, { paddingTop: vh(10) }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: vw(15),
          paddingBottom: vh(20),
        }}
      >
        <View style={styles.card}>
          <Row label="Training Name" value={data.trainingName} />
          <Row label="Trainee Name" value={data.traineeName} />
          <Row label="Trainee Email" value={data.traineeEmail} />
          <Row label="Trainee Batch No" value={data.batchNo} />
          <Row label="Exam Name" value={data.testName} />
          <Row label="Attempt" value={data.attempt} />
          <Row label="Total Questions" value={data.totalQuestions} />
          <Row label="Total Marks" value={data.totalMarks} />
          <Row label="Passing Marks" value={data.passingMarks} />
          <Row label="Obtained Marks" value={data.totalObtainedMarks} />
          <Row label="Status" value={data.passingStatus} />
          <Row label="Final Submission" value={data.finalSubmission} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Row = ({ label, value }: any) => (
  <View style={{ marginBottom: vh(10) }}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value}>{value || '-'}</TextAtom>
  </View>
);

export default ExamResponseDetailsListTrainee;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },
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
});
