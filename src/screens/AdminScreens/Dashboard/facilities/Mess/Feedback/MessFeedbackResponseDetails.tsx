import React, { useLayoutEffect, useMemo } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';

import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import { useAppSelector } from '../../../../../../hooks';

const FEEDBACK_DETAIL_FIELDS = [
  { label: 'Trainee Name', key: 'traineeName', fullWidth: true },
  { label: 'Training Name', key: 'trainingName', fullWidth: true },
  { label: 'Batch Name', key: 'batchName' },
  { label: 'Batch Number', key: 'batchNo' },
  { label: 'Hostel Name', key: 'hostelName' },
  { label: 'Room No', key: 'roomNo' },
  { label: 'Category Name', key: 'categoryName', fullWidth: true },
  { label: 'Sub Category Name', key: 'subCategoryName', fullWidth: true },
  { label: 'Topic Name', key: 'topicName', fullWidth: true },
  { label: 'Response', key: 'response' },
  { label: 'Response Date', key: 'responseDate', type: 'date' },
  { label: 'Remarks', key: 'remark', fullWidth: true },
];

const REQUIRED_PERMISSION = 'LIST FEEDBACK RESPONSE WITH RESPONSE REMARK';

const MessFeedbackResponseDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  const { crediantialData } = useAppSelector(state => state.Auth);
  const permissions = crediantialData?.globalPermissions?.permissions || [];

  const hasResponsePermission = useMemo(() => {
    return permissions.some(
      (p: any) => p.permissionName === REQUIRED_PERMISSION,
    );
  }, [permissions]);

  const visibleFields = useMemo(() => {
    return FEEDBACK_DETAIL_FIELDS.filter(field => {
      if (field.key === 'response' || field.key === 'remark') {
        if (hasResponsePermission) return true;

        const value = data?.[field.key];
        return value !== null && value !== undefined && value !== '';
      }
      return true;
    });
  }, [hasResponsePermission, data]);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Mess Feedback Response');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const resolveValue = (field: any) => {
    if (!data) return '-';

    if (field.type === 'date') {
      return data[field.key]
        ? moment(data[field.key]).format('DD-MM-YYYY')
        : '-';
    }

    if (field.type === 'dateTime') {
      return data[field.key]
        ? moment(data[field.key]).format('DD-MM-YYYY HH:mm')
        : '-';
    }

    return data[field.key] ?? '-';
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
              key={`${index}-${field.key}`}
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

export default MessFeedbackResponseDetails;

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
