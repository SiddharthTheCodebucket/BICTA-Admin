import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value ?? '-'}
    </TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.fullValue}>
      {value ?? '-'}
    </TextAtom>
  </ViewAtom>
);

const FileField = ({ label, uri }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    {uri ? (
      <TouchableOpacity
        onPress={() => Linking.openURL(uri)}
        style={styles.fileButton}
      >
        <TextAtom style={styles.fileText}>View</TextAtom>
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.value}>-</TextAtom>
    )}
  </ViewAtom>
);

const ImageField = ({ label, uri }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    {uri ? (
      <TouchableOpacity onPress={() => Linking.openURL(uri)}>
        <Image source={{ uri }} style={styles.image} />
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.fullValue}>-</TextAtom>
    )}
  </ViewAtom>
);

const EmployeeDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Employee Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField label="Employee Name" value={data?.name} />
          <FullWidthField label="Vendor Name" value={data?.vendorName} />
          <FullWidthField label="Designation" value={data?.designation} />
          <FullWidthField label="Father's Name" value={data?.fathersName} />
          <FieldRow label="Date of Birth" value={data?.dob} />

          <FieldRow label="Mobile No." value={data?.mobileNo} />
          <FieldRow
            label="Emergency Mobile No."
            value={data?.emergencyMobileNo}
          />
          <FullWidthField label="Email ID" value={data?.email} />

          <FieldRow label="Aadhaar No." value={data?.aadhaarNo} />
          <FieldRow label="PAN No." value={data?.pan} />
          <FieldRow label="Blood Group" value={data?.bloodGroup} />

          <FileField label="Aadhaar Document" uri={data?.aadhaarNoPdf} />
          <FileField label="PAN Document" uri={data?.panPdf} />

          <FieldRow label="Any Other Document" value={data?.isOtherDocument} />
          {data?.isOtherDocument === 'Yes' && (
            <FileField label="Other Document" uri={data?.otherDocumentPdf} />
          )}

          <FullWidthField label="Address" value={data?.address} />

          <ImageField label="Photo" uri={data?.photo} />
          <ImageField label="Signature" uri={data?.sign} />

          <FullWidthField
            label="Assign Reporting Officer"
            value={data?.reportingOfficerName}
          />
          <FullWidthField
            label="Assign Leave Approval Authority Officer"
            value={data?.approvalAuthority}
          />
          <FieldRow label="Approval Status" value={data?.approvalStatus} />

          <FieldRow label="Block / Unblock" value={data?.isBlacklisted} />

          {data?.isBlacklisted === 'Yes' && (
            <>
              <FullWidthField
                label="Blacklisted By"
                value={data?.blacklistedBy}
              />
              <FullWidthField
                label="Reason For Blacklisting"
                value={data?.reasonForBlacklisting}
              />
            </>
          )}
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EmployeeDetailDetails;

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
  fileButton: {
    backgroundColor: colors.backgroundColor,
    paddingVertical: vh(4),
    paddingHorizontal: vw(12),
    borderRadius: vw(6),
  },
  fileText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
    fontSize: vw(14),
  },
  image: {
    width: vw(120),
    height: vh(120),
    borderRadius: vw(8),
    marginTop: vh(5),
  },
});
