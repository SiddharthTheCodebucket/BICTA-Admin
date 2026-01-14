import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

const DEFAULT_FIELDS = [
  { label: 'Faculty U.ID', key: 'facultyUniqueId', type: 'row' },
  { label: 'Faculty Name', key: 'facultyName', type: 'row' },
  { label: 'IFSC Code', key: 'ifscCode', type: 'row' },
  { label: 'Bank Name', key: 'bankName', type: 'row' },
  { label: 'Branch Name', key: 'branchName', type: 'full' },
  { label: 'Account No', key: 'accountNo', type: 'row' },
  { label: 'PAN No.', key: 'pan', type: 'row' },
  { label: 'Category', key: 'category', type: 'row' },
  { label: 'State', key: 'state', type: 'row' },
  { label: 'Remuneration', key: 'remuneration', type: 'full' },
  { label: 'Total Class Count', key: 'totalClassCount', type: 'full' },
  { label: 'Gross Amount', key: 'totalAmountPerFaculty', type: 'full' },
  {
    label: 'TDS Deduction Amount (10%)',
    key: 'tdsDeductionAmount',
    type: 'full',
  },
  {
    label: 'Net Amount (Gross - TDS)',
    key: 'finalGrandTotalAmountPerFaculty',
    type: 'full',
  },
  { label: 'Vehicle Amount', key: 'totalVehicleAmount', type: 'full' },
  {
    label: 'Total Net Amount (Net + Vehicle)',
    key: 'finalGrandTotalAmountPerFacultyIncludingVehicle',
    type: 'full',
  },
];

const CLASS_REPORT_FIELDS = [
  { label: 'Faculty U.ID', key: 'facultyUniqueId', type: 'row' },
  { label: 'Faculty Name', key: 'facultyName', type: 'row' },
  { label: 'Training Name', key: 'trainingName', type: 'row' },
  { label: 'Batch Name', key: 'batchName', type: 'row' },
  { label: 'IFSC Code', key: 'ifscCode', type: 'row' },
  { label: 'Bank Name', key: 'bankName', type: 'row' },
  { label: 'Branch Name', key: 'branchName', type: 'full' },
  { label: 'Account No', key: 'accountNo', type: 'row' },
  { label: 'PAN No.', key: 'pan', type: 'row' },
  { label: 'Category', key: 'category', type: 'row' },
  { label: 'State', key: 'state', type: 'row' },
  { label: 'Remuneration', key: 'remuneration', type: 'row' },
  { label: 'Total Class Count', key: 'totalClassCount', type: 'row' },
  { label: 'Total Amount', key: 'totalAmountPerFaculty', type: 'row' },
];

const FacultyWiseClassReportDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};
  const isFromClassReport = route?.params?.isFromClassReport || false;

  const fieldsToRender = isFromClassReport
    ? CLASS_REPORT_FIELDS
    : DEFAULT_FIELDS;

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Wise Report');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const getValue = (key: string) => {
    const value = data?.[key];
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return value;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {fieldsToRender.map((item, index) => {
            if (item.type === 'full') {
              return (
                <ViewAtom
                  key={`${index.toString()}-list`}
                  style={styles.fullRow}
                >
                  <TextAtom style={styles.fullLabel}>{item.label}</TextAtom>
                  <TextAtom style={styles.fullValue}>
                    {getValue(item.key)}
                  </TextAtom>
                </ViewAtom>
              );
            }

            return (
              <ViewAtom key={`${index.toString()}-list`} style={styles.row}>
                <TextAtom style={styles.label}>{item.label}</TextAtom>
                <TextAtom style={styles.value}>{getValue(item.key)}</TextAtom>
              </ViewAtom>
            );
          })}
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyWiseClassReportDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(30),
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
    marginBottom: vh(12),
  },

  label: {
    flex: 1,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },

  value: {
    flex: 1,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    textAlign: 'right',
  },

  fullRow: {
    // marginTop: vh(10),
    marginBottom: vh(12),
  },

  fullLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
    marginBottom: vh(4),
  },

  fullValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
});
