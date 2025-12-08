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

const LocationDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Location Details');
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
          {/* LOCATION DETAILS */}
          <FieldRow label="Location Name" value={data?.locationName} />

          <FullWidthField label="Address" value={data?.address} />

          <FieldRow label="Street" value={data?.street} />
          <FieldRow label="Select City" value={data?.selectCity} />
          <FieldRow label="PIN Code" value={data?.pinCode} />
          <FieldRow label="Contact Person" value={data?.contactPerson} />
          <FieldRow label="Contact No" value={data?.contactNo} />
          <FieldRow
            label="Alternate Contact No"
            value={data?.alternateContactNo}
          />
          <FieldRow label="Email ID" value={data?.emailId} />
          <FieldRow label="Status" value={data?.status} />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LocationDetailDetails;

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
