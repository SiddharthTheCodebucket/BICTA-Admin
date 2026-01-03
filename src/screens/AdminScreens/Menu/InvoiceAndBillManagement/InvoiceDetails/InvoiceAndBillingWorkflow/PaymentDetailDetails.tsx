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

const FileList = ({
  label,
  files,
  fallbackUri,
}: {
  label: string;
  files?: string[];
  fallbackUri?: string;
}) => {
  let fileArray: string[] = [];

  if (Array.isArray(files)) {
    fileArray = files;
  } else if (fallbackUri) {
    fileArray = [fallbackUri];
  }

  const openFile = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Optional: show toast/snackbar if available in your project
      }
    } catch (e) {
      console.warn('Failed to open URL:', e);
    }
  };

  const getFileName = (url: string) => {
    try {
      const clean = url.split('?')[0];
      const parts: any = clean.split('/');
      return parts[parts.length - 1] || 'File';
    } catch {
      return 'File';
    }
  };

  return (
    <ViewAtom style={styles.fileRow}>
      <TextAtom style={styles.label}>{label}</TextAtom>

      {fileArray.length > 0 ? (
        <ViewAtom style={styles.filesContainer}>
          {fileArray.map((url, idx) => (
            <TouchableOpacity
              key={`${url}-${idx}`}
              onPress={() => openFile(url)}
              style={styles.fileButton}
            >
              <TextAtom
                numberOfLines={1}
                ellipsizeMode="middle"
                style={styles.fileText}
              >
                {getFileName(url)}
              </TextAtom>
            </TouchableOpacity>
          ))}
        </ViewAtom>
      ) : (
        <TextAtom style={styles.fullValue}>-</TextAtom>
      )}
    </ViewAtom>
  );
};

const PaymentDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Payment Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FieldRow label="Unique Id" value={data?.uniqueId} />
          <FieldRow
            label="Payment Date"
            value={
              data?.paymentDate
                ? moment(data.paymentDate).format('DD-MM-YYYY')
                : '-'
            }
          />
          <FieldRow label="Penalty Amount" value={data?.penalty} />
          <FieldRow label="GST Deduction Amount" value={data?.gstDeduction} />
          <FieldRow label="Income Tax Amount" value={data?.incomeTax} />
          <FieldRow
            label="Excess Bill Deduction Amount"
            value={data?.excessBillDeduction}
          />
          <FieldRow label="Other Amount" value={data?.other} />
          <FieldRow label="Net Payment" value={data?.netPayment} />
          <FieldRow label="Gross Amount" value={data?.grossAmount} />
          <FieldRow
            label="Outstanding Amount"
            value={data?.outstandingAmount}
          />

          <FullWidthField label="Payment Remark" value={data?.paymentRemark} />
          <FileList
            label="Files"
            files={data?.uploadedFile}
            fallbackUri={data?.attachFile}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentDetailDetails;

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
    alignItems: 'flex-start',
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
    flexWrap: 'wrap',
    flexShrink: 1,
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

  fileRow: {
    marginBottom: vh(10),
    alignItems: 'flex-start',
  },

  filesContainer: {
    flex: 1,
    alignItems: 'flex-end',
    gap: vh(6),
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
    textAlign: 'center',
  },
});
