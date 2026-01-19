import React, { useLayoutEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
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
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>

    {uri ? (
      <TouchableOpacity
        onPress={() => Linking.openURL(uri)}
        style={styles.viewBtn}
        activeOpacity={0.7}
      >
        <TextAtom style={styles.viewBtnText}>View</TextAtom>
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.fullValue}>-</TextAtom>
    )}
  </ViewAtom>
);
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Approved':
      return { color: colors.green };

    case 'Rejected':
      return { color: colors.red };

    case 'Pending':
      return { color: colors.warningOrange };

    default:
      return { color: colors.grey };
  }
};

const StatusRow = ({ label, status }: any) => (
  <ViewAtom style={styles.row}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={[styles.value, getStatusStyle(status)]}>
      {status || '-'}
    </TextAtom>
  </ViewAtom>
);

const LeaveApprovalDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Leave Approval Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField label="Employee Name" value={data?.employeeName} />
          <FullWidthField label="Vendor Name" value={data?.vendorName} />

          <FieldRow label="Leave Type" value={data?.leaveTypeName} />
          <FieldRow
            label="Leave Date"
            value={
              data?.leaveDate
                ? moment(data.leaveDate).format('DD-MM-YYYY')
                : '-'
            }
          />
          <FieldRow label="Session" value={data?.leaveSession} />
          <FieldRow label="Days" value={data?.leaveDays} />

          <StatusRow label="Status" status={data?.approvalStatus} />

          <FullWidthField label="Reason" value={data?.leaveReason} />
          <FullWidthField label="Remarks" value={data?.approvalRemark} />

          <ImageField label="Attachment" uri={data?.attachment} />

          <FullWidthField
            label="Recommended To"
            value={data?.reportingOfficerName}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaveApprovalDetails;

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

  image: {
    width: '100%',
    height: vh(120),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: colors.grey_1,
  },
  viewBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: vw(12),
    paddingVertical: vh(3),
    borderRadius: vw(4),
    backgroundColor: colors.primary,
  },

  viewBtnText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(13),
    color: colors.white,
  },
});
