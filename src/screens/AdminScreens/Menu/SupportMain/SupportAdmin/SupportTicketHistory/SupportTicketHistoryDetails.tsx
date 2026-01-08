import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';

import { colors, fonts, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';

const getStatusBgColor = (status?: string) => {
  switch (status) {
    case 'New':
      return '#FFE7A3';
    case 'In-progress':
      return '#2F6FDB';
    case 'Resolved':
      return '#6FB25D';
    case 'Re-open':
      return '#F39C34';
    case 'Response awaited':
      return '#8E44AD';
    default:
      return '#E0E0E0';
  }
};

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

const FieldRow = ({ label, value, valueStyle }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom style={[styles.value, valueStyle]} numberOfLines={0}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

const SupportTicketHistoryDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Support Ticket History');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const openFile = () => {
    if (data?.userUploadFile) {
      Linking.openURL(data.userUploadFile);
    }
  };

  const isImage = (url?: string) => url && /\.(jpg|jpeg|png)$/i.test(url);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FieldRow label="Tracking Id" value={data?.trackingId} />
          <FullWidthField label="Category" value={data?.category} />
          <FullWidthField label="Sub Category" value={data?.subCategory} />
          <FullWidthField
            label="Primary Issue Type"
            value={data?.primaryIssueType}
          />
          <FullWidthField label="Issue Type" value={data?.issueType} />
          <FullWidthField label="Complainant Name" value={data?.name} />
          <FullWidthField label="Designation" value={data?.designation} />
          <FieldRow label="Hostel Name" value={data?.hostelName} />
          <FieldRow label="Room No" value={data?.roomNo} />
          <FullWidthField label="Email" value={data?.email} />
          <FieldRow label="Phone" value={data?.phone} />
          <FullWidthField label="Subject" value={data?.subject} />
          <FullWidthField label="Description" value={data?.description} />

          <FieldRow
            label="Complaint Created Date"
            value={moment(data?.createdAt).format('DD-MM-YYYY HH:mm')}
          />

          <FieldRow
            label="Due Date"
            value={moment(data?.dueDate).format('DD-MM-YYYY')}
            valueStyle={{ color: colors.red_2 }}
          />

          <ViewAtom style={styles.row}>
            <TextAtom style={styles.label}>Status</TextAtom>
            <ViewAtom
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBgColor(data?.currentStatus) },
              ]}
            >
              <TextAtom style={styles.statusText}>
                {data?.currentStatus}
              </TextAtom>
            </ViewAtom>
          </ViewAtom>

          <FullWidthField
            label="Complaint Resolved Date & Time"
            value={
              data?.complainResolveDateTime
                ? moment(data.complainResolveDateTime).format(
                    'DD-MM-YYYY HH:mm',
                  )
                : '-'
            }
          />

          <ViewAtom style={styles.row}>
            <TextAtom style={styles.label}>View File</TextAtom>
            {data?.userUploadFile ? (
              <TouchableOpacity onPress={openFile}>
                {isImage(data.userUploadFile) ? (
                  <Image
                    source={{ uri: data.userUploadFile }}
                    style={styles.thumbnail}
                  />
                ) : (
                  <TextAtom style={styles.linkText}>View</TextAtom>
                )}
              </TouchableOpacity>
            ) : (
              <TextAtom style={styles.value}>-</TextAtom>
            )}
          </ViewAtom>
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SupportTicketHistoryDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(40),
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
    alignItems: 'center',
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
  statusBadge: {
    paddingHorizontal: vw(14),
    paddingVertical: vh(6),
    borderRadius: vw(20),
  },
  statusText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: '#000',
  },
  linkText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  thumbnail: {
    width: vw(60),
    height: vw(60),
    borderRadius: vw(6),
    backgroundColor: colors.light_gray_bg,
  },
  fullLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },
  fullValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
  },
  fullWidthBox: { marginBottom: vh(10) },
});
