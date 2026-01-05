import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
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

const ImageField = ({ label, uri }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>

    {uri ? (
      <Image
        source={{ uri }}
        style={{ width: '100%', height: vh(160), borderRadius: vw(8) }}
        resizeMode="contain"
      />
    ) : (
      <TextAtom style={styles.fullValue}>-</TextAtom>
    )}
  </ViewAtom>
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {/* BASIC DETAILS */}
          <FieldRow label="Training Id" value={data?.traineeId} />
          <FullWidthField
            label="Name Of Training Programme"
            value={data?.nameOfTrainingProgramme}
          />
          <FieldRow label="Batch No" value={data?.batchName} />

          {/* PERSONAL DETAILS */}
          <FieldRow label="Name" value={data?.name} />
          <FieldRow label="Father Name" value={data?.fatherName} />
          <FieldRow label="Mother Name" value={data?.motherName} />
          <FieldRow label="DOB" value={formatDate(data?.dob)} />
          <FieldRow label="Category" value={data?.category} />
          <FullWidthField
            label="Course Duration"
            value={
              data?.courseStartDate && data?.courseEndDate
                ? `${formatDate(data?.courseStartDate)} to ${formatDate(
                    data?.courseEndDate,
                  )}`
                : '-'
            }
          />
          <FieldRow label="Aadhaar No" value={maskAadhaar(data?.aadhaarNo)} />
          <FieldRow label="GPF / PRAN" value={data?.gpfOrPran} />
          <FieldRow label="PAN No" value={data?.panNo} />
          <FieldRow label="Marital Status" value={data?.maritalStatus} />
          <FieldRow label="Gender" value={data?.gender} />

          {/* CONTACT DETAILS */}
          <FieldRow label="Personal Email" value={data?.otherEmail} />
          <FullWidthField label="Email" value={data?.officeEmail} />
          <FieldRow label="Mobile No" value={data?.mobileNo} />

          {/* JOB DETAILS */}
          <FullWidthField label="Designation" value={data?.designation} />
          <FieldRow
            label="Education Qualification"
            value={data?.educationQualification}
          />
          <FieldRow label="Pay Scale" value={data?.payScale} />
          <FieldRow label="Department" value={data?.department} />

          {/* OFFICE DETAILS */}
          <FieldRow label="Office Address" value={data?.officeAddress} />
          <FieldRow label="Office District" value={data?.officeDistrict} />
          <FieldRow label="Block" value={data?.postingBlock} />
          <FieldRow label="Panchayat" value={data?.postingPanchayat} />
          <FieldRow label="Office Pincode" value={data?.officePincode} />
          <FieldRow label="Basic Pay Scale" value={data?.basicPayScale} />

          {/* RESIDENTIAL DETAILS */}
          <FieldRow
            label="Residential Address"
            value={data?.residentialAddress}
          />
          <FieldRow
            label="Residential District"
            value={data?.residentialDistrict}
          />
          <FieldRow
            label="Residential Pincode"
            value={data?.residentialPincode}
          />

          {/* EXPERIENCE */}
          <FullWidthField
            label="Previous Work Experience"
            value={data?.previousWorkExperience}
          />
          <FullWidthField
            label="Any Course On Computing"
            value={data?.attendedOrCompletedAnyOtherTraining}
          />
          <FullWidthField
            label="Knowledge Of Computing"
            value={data?.knowledgeOfComputing}
          />

          {/* RELEASE DETAILS */}
          <FullWidthField
            label="Reason For Release"
            value={data?.releasedReason}
          />
          <FullWidthField
            label="Remark For Release"
            value={data?.releasedRemark}
          />
          <FieldRow
            label="Date of Release"
            value={formatDate(data?.releasedAt)}
          />

          {/* INDEMNITY BOND */}
          <FieldRow
            label="Indemnity Bond"
            value={data?.isTraineeIndemnityBondSubmitted}
          />

          {/* IMAGES */}
          <ImageField label="Photo" uri={data?.photo} />
          <ImageField label="Sign" uri={data?.sign} />

          {/* FOOTER */}
          <FieldRow label="Created By" value={data?.createdBy?.name} />
          <FieldRow label="Updated By" value={data?.updatedBy?.name} />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TraineeReleaseDetails;

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
