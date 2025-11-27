import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../constants';
import { Header } from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
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
    Header.setNavigation(navigation, 'Allocation Details');
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
            label="Training Programme"
            value={data?.nameOfTrainingProgramme}
          />

          <FieldRow
            label="Course Start Date"
            value={
              data?.courseStartDate
                ? moment(data.courseStartDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FieldRow
            label="Course End Date"
            value={
              data?.courseEndDate
                ? moment(data.courseEndDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          {/* FULL WIDTH: NAME */}
          <FullWidthField label="Name" value={data?.name} />

          <FieldRow label="Aadhaar Number" value={data?.aadhaarNo} />
          <FieldRow label="PAN Number" value={data?.panNo} />
          <FieldRow label="Gender" value={data?.gender} />

          <FullWidthField label="Email" value={data?.officeEmail} />

          <FieldRow label="Mobile Number" value={data?.mobileNo} />

          <FullWidthField label="Department" value={data?.department} />

          <FieldRow label="Hostel" value={data?.hostelName} />
          <FieldRow label="Room" value={data?.roomNo} />
          <FieldRow label="Bed" value={data?.bedName} />

          <FieldRow label="No Of Days" value={data?.noOfDays} />
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
