import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
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

    <FieldRow label={strings.dose} value={item?.dose} />
    <FieldRow label={strings.count} value={item?.medicineCount} />

    {item?.uploadedPrescription ? (
      <TouchableOpacity
        onPress={() => Linking.openURL(item.uploadedPrescription)}
      >
        <TextAtom style={styles.prescriptionLink}>
          {strings.view_prescription}
        </TextAtom>
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
    Header.setNavigation(navigation, strings.patient_details);
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
          <FieldRow label={strings.symptom_id} value={data?.symptomId} />
          <FieldRow label={strings.patient_type} value={data?.patientType} />
          <FullWidthField label={strings.unique_id} value={data?.uniqueId} />

          <FullWidthField
            label={strings.training_name}
            value={data?.trainingName}
          />
          <FieldRow label={strings.batch_no} value={data?.batchNo} />

          <FullWidthField label={strings.name} value={data?.name} />

          <FieldRow label={strings.blood_group} value={data?.bloodGroup} />
          <FieldRow label={strings.age} value={age} />
          <FieldRow label={strings.gender} value={data?.gender} />

          <FieldRow
            label={strings.temperature}
            value={data?.temperatureInCelsius}
          />

          <FieldRow
            label={strings.blood_pressure}
            value={data?.bloodPressure}
          />
          <FieldRow label={strings.weight} value={data?.weight} />

          <FullWidthField
            label={strings.primary_observations}
            value={data?.primaryObservations}
          />

          <FieldRow
            label={strings.assigned_doctor}
            value={data?.assignDoctorName}
          />

          <FieldRow
            label={strings.treatment_types}
            value={data?.treatmentTypes}
          />

          {/* MEDICINE LIST */}
          <ViewAtom style={{ marginTop: vh(15) }}>
            <TextAtom style={styles.fullLabel}>{strings.medicines}</TextAtom>

            {data?.medicine?.length > 0 ? (
              data.medicine.map((item: any, index: number) => (
                <MedicineCard
                  key={index.toString() + item?.medicineName}
                  item={item}
                />
              ))
            ) : (
              <TextAtom style={styles.fullValue}>
                {strings.no_medicines}
              </TextAtom>
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
    backgroundColor: colors.light_gray_bg,
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
  hardcodedStyle: {
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
