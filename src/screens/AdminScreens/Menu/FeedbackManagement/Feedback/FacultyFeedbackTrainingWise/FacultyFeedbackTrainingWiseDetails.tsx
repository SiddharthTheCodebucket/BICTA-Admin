import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

const FEEDBACK_DETAIL_FIELDS = [
  { label: 'Faculty Name', key: 'facultyName', fullWidth: true },
  { label: 'Designation', key: 'designation', fullWidth: true },
  { label: 'Department', key: 'department', fullWidth: true },
  { label: 'Session Handled', key: 'sessionHandled' },
  { label: 'Subject Knowledge', key: 'subjectKnowledge' },
  { label: 'Communication', key: 'communication' },
  { label: 'Methodology', key: 'methodology' },
  { label: 'Interaction', key: 'interaction' },
  { label: 'Question Handling', key: 'questionHandling' },
  { label: 'Average Rating', key: 'averageRating' },
  { label: 'Class Count', key: 'classCount' },
  { label: 'Trainee Count', key: 'traineeCount' },
  { label: 'Feedback Count', key: 'feedbackCount' },
];

const FacultyFeedbackTrainingWiseDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Feedback Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const resolveValue = (field: any) => {
    if (!data) return '-';

    const value = data[field.key];

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return value;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {FEEDBACK_DETAIL_FIELDS.map((field, index) => (
            <ViewAtom
              key={index.toString() + field.label}
              style={field.fullWidth ? styles.fullWidthBox : styles.row}
            >
              <TextAtom
                style={field.fullWidth ? styles.fullLabel : styles.label}
              >
                {field.label}
              </TextAtom>

              <TextAtom
                numberOfLines={0}
                style={field.fullWidth ? styles.fullValue : styles.value}
              >
                {resolveValue(field)}
              </TextAtom>
            </ViewAtom>
          ))}
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyFeedbackTrainingWiseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  scrollContainer: {
    paddingBottom: vh(40),
    paddingHorizontal: vw(15),
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    padding: vw(15),
    marginTop: vh(15),
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    flex: 1,
  },

  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    flex: 1,
    textAlign: 'right',
  },

  fullWidthBox: {
    marginBottom: vh(12),
  },

  fullLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(5),
  },

  fullValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
});
