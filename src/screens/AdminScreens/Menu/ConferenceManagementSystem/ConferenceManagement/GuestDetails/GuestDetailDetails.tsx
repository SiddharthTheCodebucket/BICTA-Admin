import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';

import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

import { colors, fonts, vh, vw } from '../../../../../../constants';

const formatDateTime = (date?: string, time?: string) => {
  if (!date) return '-';
  if (!time) return moment(date).format('DD-MM-YYYY');
  return moment(`${date} ${time}`).format('DD-MM-YYYY hh:mm A');
};

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
      <TouchableOpacity onPress={() => Linking.openURL(uri)}>
        <TextAtom style={styles.linkText}>View</TextAtom>
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.value}>-</TextAtom>
    )}
  </ViewAtom>
);

const GuestDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Guest Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField
            label="Conference Name"
            value={data?.conferenceName}
          />
          <FullWidthField label="Guest Name" value={data?.name} />
          <FullWidthField label="Designation" value={data?.designation} />
          <FullWidthField label="Service" value={data?.service} />
          <FieldRow label="Batch Year" value={data?.batchYear} />
          <FullWidthField label="Organisation" value={data?.organisation} />
          <FieldRow label="State Name" value={data?.stateName} />
          <FieldRow label="Mobile No." value={data?.mobileNo} />
          <FullWidthField label="Email ID" value={data?.email} />

          <FieldRow
            label="Arrival Date & Time"
            value={formatDateTime(data?.arrivalDate, data?.arrivalTime)}
          />
          <FieldRow
            label="Mode of Travel (Arrival)"
            value={data?.modeOfTravelArrival}
          />
          <FieldRow label="Arrival Place" value={data?.arrivalPlace} />
          <FullWidthField
            label="Arrival Details"
            value={data?.arrivalDetails}
          />

          <FieldRow
            label="Departure Date & Time"
            value={formatDateTime(data?.departureDate, data?.departureTime)}
          />
          <FullWidthField
            label="Mode of Travel (Departure)"
            value={data?.modeOfTravelDeparture}
          />
          <FieldRow label="Departure Place" value={data?.departurePlace} />
          <FullWidthField
            label="Departure Details"
            value={data?.departureDetails}
          />

          <FullWidthField label="Hostel Name" value={data?.hostelName} />
          <FieldRow label="Floor Name" value={data?.floorName} />
          <FieldRow label="Room Number" value={data?.roomNumber} />

          <FullWidthField
            label="Protocol Officers"
            value={
              Array.isArray(data?.protocolOfficers)
                ? data.protocolOfficers.map((o: any) => o.name).join(', ')
                : '-'
            }
          />
          <FullWidthField
            label="Liaison Officers"
            value={
              Array.isArray(data?.liaisonOfficers)
                ? data.liaisonOfficers.map((o: any) => o.name).join(', ')
                : '-'
            }
          />

          <FieldRow label="Vehicle No." value={data?.vehicleNo} />
          <FieldRow label="Driver Name" value={data?.driverName} />
          <FieldRow label="Driver Mobile No." value={data?.driverMobileNo} />

          <FullWidthField label="Remarks (if any)" value={data?.remark} />
          <FieldRow label="Status" value={data?.currentStatus} />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuestDetailDetails;

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
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
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

  linkText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.primary,
  },
});
