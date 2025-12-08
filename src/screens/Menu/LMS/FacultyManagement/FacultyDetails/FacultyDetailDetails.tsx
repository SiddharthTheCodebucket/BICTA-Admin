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

const FacultyDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Details');
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
          <FieldRow label="Faculty U.ID" value={data?.facultyUniqueId} />
          <FieldRow label="Faculty Id" value={data?.facultyId} />
          <FieldRow label="Faculty Type" value={data?.facultyType} />
          <FieldRow
            label="Faculty Organisation"
            value={data?.facultyOrganisation}
          />

          {/* PERSONAL */}
          <FieldRow
            label="Name"
            value={`${data?.salutationName || ''} ${data?.facultyName || ''}`}
          />
          <FieldRow label="Designation" value={data?.designation} />
          <FieldRow label="Department" value={data?.department} />
          <FieldRow label="Email ID" value={data?.emailId} />
          <FieldRow label="Mobile Number" value={data?.mobileNo} />

          {/* LOCATION */}
          <FieldRow label="State" value={data?.state} />
          {data?.state === 'Outside Bihar' && (
            <FieldRow
              label="Outside Bihar State"
              value={data?.outsideBiharState}
            />
          )}

          {/* PAY DETAILS */}
          <FieldRow label="BIPARD Pay Level" value={data?.payLevel} />
          <FieldRow label="Remuneration" value={data?.remuneration} />
          <FieldRow label="Category" value={data?.category} />

          {/* STATUS & BLOCK */}
          <FieldRow label="Status" value={data?.status} />
          <FieldRow label="Block / Unblock" value={data?.isBlacklisted} />

          {/* BANK & PAN DETAILS */}
          <FieldRow label="PAN" value={data?.pan} />
          <FieldRow label="Bank Name" value={data?.bankName} />
          <FieldRow label="Branch Name" value={data?.branchName} />
          <FieldRow label="Account Holder" value={data?.accountHolderName} />
          <FieldRow label="Account No" value={data?.accountNo} />
          <FieldRow label="IFSC Code" value={data?.ifscCode} />

          <FullWidthField
            label="Faculty Subject / Expertise"
            value={data?.expertise}
          />

          <FieldRow label="Created By" value={data?.createdBy?.name} />
          <FieldRow label="Updated By" value={data?.updatedBy?.name} />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyDetailDetails;

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
