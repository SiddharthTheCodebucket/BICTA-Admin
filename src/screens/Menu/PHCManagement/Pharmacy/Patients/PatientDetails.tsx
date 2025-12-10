import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../constants';
import { Header } from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import moment from 'moment';

// Row Component
const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

// Full Width Component
const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.fullValue}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

// Medicine Card
const MedicineCard = ({ item }: any) => (
  <ViewAtom style={styles.medicineCard}>
    <TextAtom style={styles.medicineName}>
      {item?.medicineName} ({item?.medicineType})
    </TextAtom>

    <FieldRow label="Dose" value={item?.dose} />
    <FieldRow label="Count" value={item?.medicineCount} />

    {item?.uploadedPrescription ? (
      <TouchableOpacity
        onPress={() => Linking.openURL(item.uploadedPrescription)}
      >
        <TextAtom style={styles.prescriptionLink}>View Prescription</TextAtom>
      </TouchableOpacity>
    ) : null}
  </ViewAtom>
);

const PatientDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  // Age calculation
  const age = data?.dateOfBirth
    ? moment().diff(moment(data.dateOfBirth), 'years')
    : '-';

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Patient Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {/* PATIENT DETAILS FIELDS */}
          <FieldRow label="Symptom ID" value={data?.symptomId} />
          <FieldRow label="Patient Type" value={data?.patientType} />
          <FullWidthField label="Unique ID" value={data?.uniqueId} />

          <FullWidthField label="Training Name" value={data?.trainingName} />
          <FieldRow label="Batch No" value={data?.batchNo} />

          <FullWidthField label="Name" value={data?.name} />

          <FieldRow label="Blood Group" value={data?.bloodGroup} />
          <FieldRow label="Age" value={age} />
          <FieldRow label="Gender" value={data?.gender} />

          <FieldRow
            label="Temperature (°C)"
            value={data?.temperatureInCelsius}
          />

          <FieldRow label="Blood Pressure" value={data?.bloodPressure} />
          <FieldRow label="Weight (kg)" value={data?.weight} />

          <FullWidthField
            label="Primary Observations"
            value={data?.primaryObservations}
          />

          <FieldRow label="Assigned Doctor" value={data?.assignDoctorName} />

          <FieldRow label="Treatment Types" value={data?.treatmentTypes} />

          {/* MEDICINE LIST */}
          <ViewAtom style={{ marginTop: vh(15) }}>
            <TextAtom style={styles.fullLabel}>Medicines</TextAtom>

            {data?.medicine?.length > 0 ? (
              data.medicine.map((item: any, index: number) => (
                <MedicineCard key={index} item={item} />
              ))
            ) : (
              <TextAtom style={styles.fullValue}>No Medicines</TextAtom>
            )}
          </ViewAtom>
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientDetails;

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

  medicineCard: {
    padding: vw(12),
    borderRadius: vw(8),
    backgroundColor: '#F7F7F7',
    marginBottom: vh(10),
  },

  medicineName: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(15),
    marginBottom: vh(5),
    color: colors.grey,
  },

  prescriptionLink: {
    marginTop: vh(8),
    color: colors.primary,
    textDecorationLine: 'underline',
    fontFamily: fonts.Roboto_Medium,
  },
});
