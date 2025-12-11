import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';

// Row Component
const FieldRow = ({ label, value, valueStyle }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={[styles.value, valueStyle]}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

// Full Width Row
const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.fullValue}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

const PatientDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Patient Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  // Temp color logic
  const getTempColor = (temp: number) => {
    if (!temp) return colors.grey;
    if (temp < 36.5 || temp > 37.5) return 'red';
    return colors.grey;
  };

  // BP color logic
  const getBPColor = (bp: string) => {
    if (!bp) return colors.grey;
    const [sys, dia] = bp.split('/').map(Number);

    if (!sys || !dia) return colors.grey;

    const isSysNormal = sys >= 90 && sys <= 120;
    const isDiaNormal = dia >= 60 && dia <= 80;

    if (!isSysNormal || !isDiaNormal) return 'red';
    return colors.grey;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {/* REQUIRED KEYS ONLY */}

          <FieldRow label="Patient Type" value={data?.patientType} />

          <FieldRow label="ID" value={data?.id} />

          <FieldRow label="Visit Count" value={data?.visitCount} />

          <FullWidthField label="Name" value={data?.name} />

          <FullWidthField label="Training Name" value={data?.trainingName} />

          <FieldRow label="Batch" value={data?.batchNo} />

          <FieldRow
            label="DOB"
            value={
              data?.dateOfBirth
                ? moment(data.dateOfBirth).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FieldRow label="Blood Group" value={data?.bloodGroup} />

          <FieldRow label="Sex" value={data?.gender} />

          <FieldRow
            label="Temp (°C)"
            value={
              data?.temperatureInCelsius
                ? `${data?.temperatureInCelsius}°C`
                : '-'
            }
            valueStyle={{
              color: getTempColor(Number(data?.temperatureInCelsius)),
            }}
          />
          <FieldRow
            label="BP (mmHg)"
            value={data?.bloodPressure}
            valueStyle={{ color: getBPColor(data?.bloodPressure) }}
          />

          <FieldRow label="Weight (Kg)" value={data?.weight} />

          <FullWidthField label="Doctor" value={data?.assignDoctorName} />

          <FieldRow label="Treatment Type" value={data?.treatmentTypes} />

          <FullWidthField label="Symptoms" value={data?.primaryObservations} />

          <FieldRow
            label="Date"
            value={
              data?.currentDatetime
                ? moment(data.currentDatetime).format('DD-MM-YYYY hh:mm A')
                : '-'
            }
          />

          <FieldRow label="Created By" value={data?.createdBy} />
          <FieldRow label="Updated By" value={data?.updatedBy} />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDetailDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },

  scrollContainer: { paddingBottom: vh(40), paddingHorizontal: vw(15) },

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

  fullWidthBox: { marginBottom: vh(12) },

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
