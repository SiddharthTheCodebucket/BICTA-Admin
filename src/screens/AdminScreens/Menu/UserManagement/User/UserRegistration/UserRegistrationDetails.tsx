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
import moment from 'moment';

const maskAadhaar = (aadhaar?: string) => {
  if (!aadhaar || aadhaar.length < 4) return '-';
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
};

const FieldRow = ({ label, value }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={styles.value} numberOfLines={0}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>
    {typeof value === 'string' || typeof value === 'number' ? (
      <TextAtom style={styles.fullValue}>{value || '-'}</TextAtom>
    ) : (
      value
    )}
  </ViewAtom>
);

const UserRegistrationDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  const dob = data?.pickADob
    ? moment(data.pickADob).format('DD MMM YYYY')
    : '-';

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'User Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const isImageFile = (url?: string) => {
    if (!url) return false;
    return /\.(png|jpg|jpeg)$/i.test(url);
  };

  const renderAttachedFile = () => {
    if (!data?.attachedFile) {
      return <TextAtom style={styles.fullValue}>-</TextAtom>;
    }

    const openFile = () => Linking.openURL(data.attachedFile);

    if (isImageFile(data.attachedFile)) {
      return (
        <TouchableOpacity onPress={openFile}>
          <ViewAtom style={styles.thumbnailWrapper}>
            <Image
              source={{ uri: data.attachedFile }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </ViewAtom>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={openFile}>
        <TextAtom style={styles.linkText}>View</TextAtom>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField label="Name" value={data?.name} />

          <FieldRow label="DOB" value={dob} />

          <FieldRow label="Aadhaar No" value={maskAadhaar(data?.aadhaarNo)} />

          <FieldRow label="PAN No" value={data?.panNo} />
          <FieldRow label="PRAN" value={data?.pran} />

          <FullWidthField label="Official Email" value={data?.officialEmail} />

          <FullWidthField label="Personal Email" value={data?.personalEmail} />

          <FieldRow label="Mobile" value={data?.mobile} />

          <FieldRow label="Designation" value={data?.selectDesignation} />

          <FieldRow label="Section" value={data?.selectSection} />

          <FieldRow label="Requested By" value={data?.selectRequestedBy} />

          <FullWidthField label="Attached File" value={renderAttachedFile()} />

          <FieldRow label="Center" value={data?.trainingCenterName} />

          <FieldRow label="User Type" value={data?.userType} />
          <FieldRow
            label="Status"
            value={data?.status === 'Active' ? 'Approved' : data?.status}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserRegistrationDetails;

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

  linkText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  thumbnailWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  thumbnail: {
    width: vw(60),
    height: vw(60),
    borderRadius: vw(6),
    marginRight: vw(10),
    backgroundColor: colors.light_gray_bg,
  },

  viewText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.primary,
  },
});
