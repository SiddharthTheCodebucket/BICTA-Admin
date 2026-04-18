import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import AdminPageHeader from '../../../../../../components/organisms/AdminPageHeader';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';
import { FormFieldWrapper } from '../../../../../../components/templates';

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

const TraineeReleaseDetails = ({ route, navigation }: any) => {
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

  const formatDate = (d: any) => (d ? moment(d).format('DD-MM-YYYY') : '-');

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {/* <AdminPageHeader title="Trainee Release" navigation={navigation} /> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <FormFieldWrapper>
          <View style={styles.mainCard}>
            {/* Trainee Profile Header */}
            <View style={styles.summaryContainer}>
              <View style={styles.initialCircle}>
                <TextAtom style={styles.initialText}>
                  {data?.name?.[0] || '?'}
                </TextAtom>
              </View>
              <View>
                <TextAtom style={styles.summaryName}>{data?.name}</TextAtom>
                <TextAtom style={styles.trainingIdText}>
                  Training Id - {data?.traineeId || '-'}
                </TextAtom>
              </View>
            </View>

            <Section title="Personal Details">
              <DetailRow
                left={{ label: 'Name', value: data?.name }}
                right={{ label: 'Father Name', value: data?.fatherName }}
              />
              <DetailRow
                left={{ label: 'Mother Name', value: data?.motherName }}
                right={{ label: 'DOB', value: formatDate(data?.dob) }}
              />
              <DetailRow
                left={{ label: 'Marital Status', value: data?.maritalStatus }}
                right={{ label: 'Gender', value: data?.gender }}
              />
              <DetailRow
                left={{ label: 'Designation', value: data?.designation }}
                right={{ label: 'Mobile No', value: data?.mobileNo }}
              />
              <DetailRow
                left={{ label: 'PAN No.', value: data?.panNo }}
                right={{
                  label: 'Aadhaar No',
                  value: maskAadhaar(data?.aadhaarNo),
                }}
              />
              <FullWidthRow label="Personal Email" value={data?.otherEmail} />
            </Section>

            <Section title="Other Details">
              <FullWidthRow label="Official Email" value={data?.officeEmail} />
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
                    ? `${formatDate(data?.courseStartDate)} to ${formatDate(
                        data?.courseEndDate,
                      )}`
                    : '-'
                }
              />
              <DetailRow
                left={{ label: 'GPF / PRAN', value: data?.gpfOrPran }}
                right={{ label: 'Pay Scale', value: data?.payScale }}
              />
              <FullWidthRow
                label="Highest Education Qualification"
                value={data?.educationQualification}
              />
              <DetailRow
                left={{
                  label: 'Basic Pay Scale/Honorarium',
                  value: data?.basicPayScale,
                }}
                right={{ label: 'Department', value: data?.department }}
              />
              <FullWidthRow
                label="Office Address"
                value={data?.officeAddress}
              />
              <DetailRow
                left={{
                  label: 'Residential Address',
                  value: data?.residentialAddress,
                }}
                right={{
                  label: 'Previous Work Experience',
                  value: data?.previousWorkExperience,
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
            </Section>
          </View>
        </FormFieldWrapper>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TraineeReleaseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  scrollContainer: {
    paddingBottom: vh(40),
    paddingHorizontal: vw(15),
  },
  mainCard: {
    backgroundColor: colors.backgroundColor,
    borderRadius: vw(10),
    padding: vw(8),
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
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    color: colors.black,
  },
  trainingIdText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
  },
  section: {
    marginBottom: vh(12),
  },
  sectionTitle: {
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary_dark_blue,
    marginBottom: vh(8),
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
});
