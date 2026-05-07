import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';

const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.fullValue}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

const TrainneHostelAllocationDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelAllocationHistory.allocationDetails,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField
            label={
              strings.hostelManagement.hostelAllocationHistory.trainingProgramme
            }
            value={data?.nameOfTrainingProgramme}
          />

          <FieldRow
            label={
              strings.hostelManagement.hostelAllocationHistory.courseStartDate
            }
            value={
              data?.courseStartDate
                ? moment(data.courseStartDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FieldRow
            label={
              strings.hostelManagement.hostelAllocationHistory.courseEndDate
            }
            value={
              data?.courseEndDate
                ? moment(data.courseEndDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          {/* FULL WIDTH: NAME */}
          <FullWidthField
            label={strings.hostelManagement.hostelAllocationHistory.name}
            value={data?.name}
          />

          <FieldRow
            label={
              strings.hostelManagement.hostelAllocationHistory.aadhaarNumber
            }
            value={data?.aadhaarNo}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocationHistory.panNumber}
            value={data?.panNo}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocationHistory.gender}
            value={data?.gender}
          />

          <FullWidthField
            label={strings.hostelManagement.hostelAllocationHistory.email}
            value={data?.officeEmail}
          />

          <FieldRow
            label={
              strings.hostelManagement.hostelAllocationHistory.mobileNumber
            }
            value={data?.mobileNo}
          />

          <FullWidthField
            label={strings.hostelManagement.hostelAllocationHistory.department}
            value={data?.department}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocationHistory.hostel}
            value={data?.hostelName}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocationHistory.room}
            value={data?.roomNo}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocationHistory.bed}
            value={data?.bedName}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocationHistory.noOfDays}
            value={data?.noOfDays}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainneHostelAllocationDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },

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

  /* EXISTING HALF ROW */
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
