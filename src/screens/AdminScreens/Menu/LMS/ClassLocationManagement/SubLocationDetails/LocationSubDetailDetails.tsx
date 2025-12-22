import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
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

const LocationSubDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.locationDetails.subLocationDetailsTitle,
    );
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
          <FieldRow label={strings.lms.locationDetails.srNo} value={data?.id} />

          <FieldRow
            label={strings.lms.locationDetails.selectLocationName}
            value={data?.selectLocationName}
          />

          <FieldRow
            label={strings.lms.locationDetails.subLocationName}
            value={data?.subLocationName}
          />

          <FieldRow
            label={strings.lms.locationDetails.contactPerson}
            value={
              data?.subLocationContactPerson
                ? data?.subLocationContactPerson
                : data?.contactPerson
            }
          />

          <FieldRow
            label={strings.lms.locationDetails.contactNo}
            value={
              data?.subLocationContactNo
                ? data?.subLocationContactNo
                : data?.contactNo
            }
          />

          <FieldRow
            label={strings.lms.locationDetails.totalCapacity}
            value={data?.totalCapacity}
          />

          <FieldRow
            label={strings.lms.locationDetails.status}
            value={data?.status}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LocationSubDetailDetails;

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
