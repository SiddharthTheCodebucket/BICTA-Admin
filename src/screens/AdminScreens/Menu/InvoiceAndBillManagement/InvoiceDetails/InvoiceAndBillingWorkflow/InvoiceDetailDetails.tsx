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
        <TextAtom style={styles.fileText}>View File</TextAtom>
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.fullValue}>-</TextAtom>
    )}
  </ViewAtom>
);

const InvoiceDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Invoice Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const formatAmount = (num: any) => {
    if (num === null || num === undefined) return '-';
    return `₹${Number(num).toLocaleString('en-IN')}`;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField label="Vendor Name" value={data?.vendorName} />
          <FullWidthField label="Unique Id" value={data?.uniqueId} />
          <FullWidthField label="Subject" value={data?.subject} />

          <FileField label="View File" uri={data?.attachFile} />

          <FieldRow label="Invoice Number" value={data?.invoiceNumber} />
          <FieldRow label="Invoice Date" value={data?.invoiceDate} />
          <FieldRow label="Invoice Upload Date" value={data?.sentOn} />
          <FieldRow label="File No" value={data?.fileNo} />
          <FieldRow label="Invoice Type" value={data?.invoiceTypeName} />
          <FieldRow
            label="Invoice Amount"
            value={formatAmount(data?.invoiceAmount)}
          />

          <FieldRow label="BIPARD Campus" value={data?.bipardCentreName} />

          <FieldRow
            label="Currently Assigned To"
            value={data?.currentlyAssignedTo}
          />
          <FieldRow label="Assign Date" value={data?.dateOfAssign} />
          <FieldRow label="Status" value={data?.currentStatus} />

          <FieldRow
            label="Is Payment Received"
            value={data?.isPaymentSuccess}
          />
          <FieldRow label="Paid Date" value={data?.paidDate} />

          <FieldRow
            label="Penalty Amount"
            value={formatAmount(data?.penaltyAmount)}
          />
          <FieldRow
            label="Tax Deduction"
            value={formatAmount(data?.incomeTax)}
          />
          <FieldRow
            label="Excess Bill Deduction"
            value={formatAmount(data?.excessBillDeduction)}
          />
          <FieldRow
            label="Net Payment"
            value={formatAmount(data?.netPayment)}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvoiceDetailDetails;

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
    paddingVertical: vh(3),
    paddingHorizontal: vw(10),
    borderRadius: vw(6),
    alignItems: 'center',
  },

  fileText: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
    fontSize: vw(14),
  },
});
