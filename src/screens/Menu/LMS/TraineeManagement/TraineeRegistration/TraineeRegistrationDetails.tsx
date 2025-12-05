import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
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

const ImageField = ({ label, uri, onPress }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>

    {uri ? (
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: vh(120), borderRadius: vw(8) }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.fullValue}>-</TextAtom>
    )}
  </ViewAtom>
);

const TraineeRegistrationDetails = ({ route, navigation }: any) => {
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {/* ID */}
          <FieldRow label="Id" value={data?.id} />

          {/* U.ID */}
          <FieldRow label="U.Id" value={data?.userUniqueId} />

          {/* Name */}
          <FieldRow label="Name" value={data?.name} />

          {/* Training Centre */}
          <FieldRow label="Training Centre" value={data?.trainingCentre} />

          {/* DOB */}
          <FieldRow
            label="DOB"
            value={data?.dob ? moment(data?.dob).format('DD-MM-YYYY') : '-'}
          />

          {/* Blood Group */}
          <FieldRow label="Blood Group" value={data?.bloodGroup} />

          {/* Aadhaar */}
          <FieldRow label="Aadhaar No" value={maskAadhaar(data?.aadhaarNo)} />

          {/* Email */}
          <FieldRow label="Email" value={data?.officeEmail} />

          {/* Mobile */}
          <FieldRow label="Mobile Number" value={data?.mobileNo} />

          {/* Designation */}
          <FieldRow label="Designation" value={data?.designation} />

          {/* Place of Posting */}
          <FieldRow label="Place Of Posting" value={data?.placeOfPosting} />

          {/* Gender */}
          <FieldRow label="Gender" value={data?.gender} />

          {/* Pregnancy Status */}
          <FieldRow label="Pregnancy Status" value={data?.pregnancyStatus} />

          {/* Training Name */}
          <FieldRow
            label="Training Name"
            value={data?.nameOfTrainingProgramme}
          />

          {/* Batch No */}
          <FieldRow label="Batch No" value={data?.batchName} />

          {/* Created By */}
          <FieldRow label="Created By" value={data?.createdBy?.name} />

          {/* Updated By */}
          <FieldRow label="Updated By" value={data?.updatedBy?.name} />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TraineeRegistrationDetails;

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
