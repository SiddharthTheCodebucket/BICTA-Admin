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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {/* Training Id */}
          <FieldRow label="Training Id" value={data?.id} />

          {/* Name Of Training Programme */}
          <FullWidthField
            label="Name Of Training Programme"
            value={data?.nameOfTrainingProgramme}
          />

          {/* Batch No */}
          <FieldRow label="Batch No" value={data?.batchName} />

          {/* Name */}
          <FieldRow label="Name" value={data?.name} />

          {/* Father Name */}
          <FieldRow label="Father Name" value={data?.fatherName} />

          {/* Mother Name */}
          <FieldRow label="Mother Name" value={data?.motherName} />

          {/* DOB */}
          <FieldRow
            label="DOB"
            value={data?.dob ? moment(data?.dob).format('DD-MM-YYYY') : '-'}
          />

          {/* Blood Group */}
          <FieldRow label="Blood Group" value={data?.bloodGroup} />

          {/* Category */}
          <FieldRow label="Category" value={data?.category} />

          {/* Course Duration */}
          <FieldRow
            label="Course Duration"
            value={
              data?.courseStartDate && data?.courseEndDate
                ? `${moment(data.courseStartDate).format(
                    'DD-MM-YYYY',
                  )} to ${moment(data.courseEndDate).format('DD-MM-YYYY')}`
                : '-'
            }
          />

          {/* Aadhaar */}
          <FieldRow label="Aadhaar No" value={maskAadhaar(data?.aadhaarNo)} />

          {/* GPF / PRAN */}
          <FieldRow label="GPF / PRAN" value={data?.gpfOrPran} />

          {/* PAN No */}
          <FieldRow label="PAN No" value={data?.panNo} />

          {/* Marital Status */}
          <FieldRow label="Marital Status" value={data?.maritalStatus} />

          {/* Gender */}
          <FieldRow label="Gender" value={data?.gender} />

          {/* Pregnancy Status */}
          <FieldRow label="Pregnancy Status" value={data?.pregnancyStatus} />

          {/* Personal Email */}
          <FieldRow label="Personal Email" value={data?.otherEmail} />

          {/* Office Email */}
          <FullWidthField label="Email" value={data?.officeEmail} />

          {/* Designation */}
          <FullWidthField label="Designation" value={data?.designation} />

          {/* Education Qualification */}
          <FieldRow
            label="Education Qualification"
            value={data?.educationQualification}
          />

          {/* Mobile Number */}
          <FieldRow label="Mobile No" value={data?.mobileNo} />

          {/* Pay Scale */}
          <FieldRow label="Pay Scale" value={data?.payScale} />

          {/* Department */}
          <FieldRow label="Department" value={data?.department} />

          {/* Office Address */}
          <FullWidthField label="Office Address" value={data?.officeAddress} />

          {/* Office District */}
          <FieldRow label="Office District" value={data?.officeDistrict} />

          {/* Block */}
          <FieldRow label="Block" value={data?.postingBlock} />

          {/* Panchayat */}
          <FieldRow label="Panchayat" value={data?.postingPanchayat} />

          {/* Office Pincode */}
          <FieldRow label="Office Pincode" value={data?.officePincode} />

          {/* Basic Pay Scale */}
          <FieldRow label="Basic Pay Scale" value={data?.basicPayScale} />

          {/* Residential Address */}
          <FullWidthField
            label="Residential Address"
            value={data?.residentialAddress}
          />

          {/* Residential District */}
          <FieldRow
            label="Residential District"
            value={data?.residentialDistrict}
          />

          {/* Residential Pincode */}
          <FieldRow
            label="Residential Pincode"
            value={data?.residentialPincode}
          />

          {/* Previous Work Experience */}
          <FullWidthField
            label="Previous Work Experience"
            value={data?.previousWorkExperienceText}
          />

          {/* Any Course on Computing */}
          <FullWidthField
            label="Any Course On Computing"
            value={data?.attendedOrCompletedAnyOtherTraining}
          />

          {/* Knowledge of Computing */}
          <FullWidthField
            label="Knowledge Of Computing"
            value={data?.knowledgeOfComputing}
          />

          {/* Indemnity Bond */}
          <FieldRow
            label="Indemnity Bond"
            value={data?.isTraineeIndemnityBondSubmitted}
          />

          {/* Photo */}
          <ImageField
            label="Photo"
            uri={data?.photo}
            onPress={() => console.log('open photo')}
          />

          {/* Sign */}
          <ImageField
            label="Sign"
            uri={data?.sign}
            onPress={() => console.log('open sign')}
          />

          {/* Created By */}
          <FieldRow label="Created By" value={data?.createdBy?.name} />

          {/* Updated By */}
          <FieldRow label="Updated By" value={data?.updatedBy?.name} />
        </ViewAtom>
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
