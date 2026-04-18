import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import FormWhiteButton from '../../../../../../components/templates/FormWhiteButton';
import FormGradientButton from '../../../../../../components/templates/FormGradientButton';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';

const DetailRow = ({ left, right }: any) => (
  <View style={styles.row}>
    <View style={styles.field}>
      <TextAtom style={styles.label}>{left?.label}</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {left?.value || '-'}
      </TextAtom>
    </View>
    <View style={styles.field}>
      <TextAtom style={styles.label}>{right?.label}</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {right?.value || '-'}
      </TextAtom>
    </View>
  </View>
);

const FullWidthRow = ({ label, value }: any) => (
  <View style={styles.fullWidthField}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value || '-'}
    </TextAtom>
  </View>
);

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <TextAtom style={styles.sectionTitle}>{title}</TextAtom>
    {children}
  </View>
);

const TraineeFullDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Trainee Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar) return '-';
    const last4 = aadhaar.slice(-4);
    return `XXXX XXXX ${last4}`;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* <AdminPageHeader title="Trainee Details" navigation={navigation} /> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.mainCard}>
          <View
            style={{
              backgroundColor: colors.backgroundColor,
              borderRadius: 8,
              padding: 8,
            }}
          >
            {/* Trainee Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.initialCircle}>
                <TextAtom style={styles.initialText}>
                  {data?.name?.[0] || '?'}
                </TextAtom>
              </View>
              <TextAtom style={styles.summaryName}>{data?.name}</TextAtom>
            </View>

            <Section title="Personal Details">
              <DetailRow
                left={{ label: 'Name', value: data?.name }}
                right={{ label: 'Father Name', value: data?.fatherName }}
              />
              <DetailRow
                left={{ label: 'Mother Name', value: data?.motherName }}
                right={{
                  label: 'DOB',
                  value: data?.dob
                    ? moment(data.dob).format('DD-MM-YYYY')
                    : '-',
                }}
              />
              <DetailRow
                left={{ label: 'Blood Group', value: data?.bloodGroup }}
                right={{
                  label: 'Aadhaar No',
                  value: maskAadhaar(data?.aadhaarNo),
                }}
              />
              <DetailRow
                left={{ label: 'Gender', value: data?.gender }}
                right={{
                  label: 'Pregnancy Status',
                  value: data?.pregnancyStatus,
                }}
              />
              <DetailRow
                left={{ label: 'Designation', value: data?.designation }}
                right={{ label: 'Mobile No', value: data?.mobileNo }}
              />
              <DetailRow
                left={{ label: 'PAN No', value: data?.panNo }}
                right={{ label: 'Marital Status', value: data?.maritalStatus }}
              />
              <FullWidthRow
                label="Email"
                value={data?.officeEmail || data?.otherEmail}
              />
            </Section>

            <Section title="Other Details">
              <DetailRow
                left={{ label: 'Attendance Code', value: '-' }}
                right={{ label: 'Total Days', value: '-' }}
              />
              <DetailRow
                left={{ label: 'Present Days', value: '-' }}
                right={{ label: 'Attendance (%)', value: '-' }}
              />
              <DetailRow
                left={{ label: 'Training Id', value: data?.id }}
                right={{ label: 'Trainee Id', value: data?.traineeId }}
              />
              <FullWidthRow
                label="Name Of Training Programme"
                value={data?.nameOfTrainingProgramme}
              />
              <DetailRow
                left={{ label: 'Batch No', value: data?.batchName }}
                right={{ label: 'Category', value: data?.category }}
              />
              <FullWidthRow
                label="Course Duration"
                value={
                  data?.courseStartDate && data?.courseEndDate
                    ? `${moment(data.courseStartDate).format(
                        'DD-MM-YYYY',
                      )} to ${moment(data.courseEndDate).format('DD-MM-YYYY')}`
                    : '-'
                }
              />
              <DetailRow
                left={{ label: 'GPF / PRAN', value: data?.gpfOrPran }}
                right={{
                  label: 'Place Of Posting',
                  value: data?.officeDistrict,
                }}
              />
              <FullWidthRow
                label="Highest Education Qualification"
                value={data?.educationQualification}
              />
              <DetailRow
                left={{ label: 'Stream / Subject Name', value: '-' }}
                right={{ label: 'University / Institute Name', value: '-' }}
              />
              <DetailRow
                left={{ label: 'Passing Year', value: '-' }}
                right={{ label: 'Certificate / Marksheet No', value: '-' }}
              />
              <DetailRow
                left={{ label: 'Pay Scale', value: data?.payScale }}
                right={{
                  label: 'Basic Pay Scale/Honorarium',
                  value: data?.basicPayScale,
                }}
              />
              <DetailRow
                left={{ label: 'Department', value: data?.department }}
                right={{ label: 'Office Address', value: data?.officeAddress }}
              />
              <FullWidthRow
                label="Residential Address"
                value={data?.residentialAddress}
              />
              <DetailRow
                left={{
                  label: 'Previous Work Experience',
                  value: data?.previousWorkExperienceText,
                }}
                right={{
                  label: 'Residential District',
                  value: data?.residentialDistrict,
                }}
              />
              <DetailRow
                left={{
                  label: 'Any Course On Computing',
                  value: data?.attendedOrCompletedAnyOtherTraining,
                }}
                right={{
                  label: 'Knowledge Of Computing',
                  value: data?.knowledgeOfComputing,
                }}
              />
              <DetailRow
                left={{
                  label: 'Indemnity Bond',
                  value: data?.isTraineeIndemnityBondSubmitted,
                }}
                right={{ label: 'Created By', value: data?.createdBy?.name }}
              />
              <DetailRow
                left={{ label: 'Updated By', value: data?.updatedBy?.name }}
                right={{ label: 'File', value: 'Attached' }}
              />
            </Section>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={{ flex: 1, marginRight: 4 }}>
            <FormWhiteButton
              buttonStyle={{ height: 46 }}
              title="Delete"
              onPress={() => {}}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 4 }}>
            <FormGradientButton
              buttonStyle={{ height: 46 }}
              title="Edit"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TraineeFullDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  scrollContainer: {
    paddingBottom: vh(16),
    paddingHorizontal: vw(15),
  },
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(8),
    marginTop: vh(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(12),
    marginBottom: vh(25),
  },
  initialCircle: {
    width: vw(40),
    height: vw(40),
    borderRadius: vw(20),
    backgroundColor: '#E8EFF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: colors.primary,
    fontSize: vw(18),
    fontFamily: fonts.Roboto_Bold,
  },
  summaryName: {
    fontSize: vw(18),
    fontFamily: fonts.Roboto_Bold,
    color: colors.black,
  },
  section: {
    marginBottom: vh(25),
  },
  sectionTitle: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary_dark_blue,
    marginBottom: vh(15),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(15),
  },
  field: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.grey,
    marginBottom: vh(2),
  },
  value: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  fullWidthField: {
    marginBottom: vh(15),
  },
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.chinese_silver,
  },
});
