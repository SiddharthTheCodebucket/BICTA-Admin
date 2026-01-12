import React, { useLayoutEffect, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';
import { useAppSelector } from '../../../../../../hooks';

const FEEDBACK_DETAIL_FIELDS = [
  { label: 'Training Name (ID)', key: 'trainingNameWithId', fullWidth: true },
  { label: 'Batch No', key: 'batchNo' },
  { label: 'Faculty Name (ID)', key: 'facultyNameWithId', fullWidth: true },
  { label: 'Observer Name (ID)', key: 'observerNameWithId', fullWidth: true },
  { label: 'Date Of Class', key: 'dateOfClass', type: 'date' },
  { label: 'Subject Name', key: 'subjectName', fullWidth: true },
  { label: 'Topic Name', key: 'topicName', fullWidth: true },
  { label: 'Session Handled', key: 'sessionHandledId' },
  { label: 'Subject Knowledge', key: 'subjectKnowledgeId' },
  { label: 'Communication', key: 'communicationId' },
  { label: 'Methodology', key: 'methodology' },
  { label: 'Interaction', key: 'interaction' },
  { label: 'Question Handling', key: 'questionHandling' },
  { label: 'Remarks', key: 'remark', fullWidth: true },
];

const REQUIRED_PERMISSION = 'LIST FACULTY FEEDBACK WITH RESPONSE REMARK';

const RESTRICTED_KEYS = new Set<string>([
  'sessionHandled',
  'subjectKnowledge',
  'communication',
  'methodology',
  'interaction',
  'questionHandling',
  'remark',
]);

const FacultyFeedbackByObserverDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  const { crediantialData } = useAppSelector(state => state.Auth);
  const permissions = crediantialData?.globalPermissions?.permissions || [];

  const hasResponsePermission = useMemo(() => {
    return permissions.some(
      (p: any) =>
        p.permissionName?.trim().toLowerCase() ===
        REQUIRED_PERMISSION.toLowerCase(),
    );
  }, [permissions]);

  const visibleFields = useMemo(() => {
    return FEEDBACK_DETAIL_FIELDS.filter(field => {
      if (RESTRICTED_KEYS.has(field.key)) {
        if (hasResponsePermission) return true;
        const value = data?.[field.key];
        return value !== null && value !== undefined && value !== '';
      }
      return true;
    });
  }, [hasResponsePermission, data]);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Feedback Observer');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const resolveValue = (field: any) => {
    if (!data) return '-';

    switch (field.key) {
      case 'trainingNameWithId':
        return data?.trainingName && data?.trainingId
          ? `${data.trainingName} (${data.trainingId})`
          : '-';

      case 'facultyNameWithId':
        return data?.facultyName && data?.facultyId
          ? `${data.facultyName} (${data.facultyId})`
          : '-';

      case 'observerNameWithId':
        return data?.observerName && data?.observerId
          ? `${data.observerName} (${data.observerId})`
          : '-';

      case 'dateOfClass':
        return data?.dateOfClass
          ? moment(data.dateOfClass).format('DD-MM-YYYY')
          : '-';

      default:
        return data[field.key] ?? '-';
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {visibleFields.map((field, index) => (
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

export default FacultyFeedbackByObserverDetails;

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
