import React, { useLayoutEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { pick } from '@react-native-documents/picker';

import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';

import {
  useReportListFacultyMutation,
  useReportUploadHonorariumMutation,
} from '../../../../../../injectEndpoints/reportEndpoints';

import { downloadAndOpenFile } from '../../../../../../utils/CommonFunction';

const FIELDS = [
  { label: 'Faculty U.ID', key: 'facultyUniqueId' },
  { label: 'Faculty Id', key: 'facultyId' },
  { label: 'Faculty Name', key: 'facultyName' },
  { label: 'Training Name', key: 'trainingName' },
  { label: 'Batch No', key: 'batchNo' },
  { label: 'Designation', key: 'facultyDesignation' },
  { label: 'Date', key: 'date' },
  { label: 'From Time', key: 'fromTime' },
  { label: 'To Time', key: 'toTime' },
  { label: 'Topic', key: 'topic' },
  { label: 'Class Confirmed By', key: 'classConfirmedBy' },
  { label: 'Class Approved By', key: 'classApprovedBy' },
  { label: 'Amount', key: 'amount' },
  { label: 'PAN No.', key: 'pan' },
  { label: 'Bank Name', key: 'bankName' },
  { label: 'Account No', key: 'accountNo' },
  { label: 'IFSC Code', key: 'ifscCode' },
  { label: 'Honorarium Uploaded', key: 'isHonorariumPaymentLetterUploaded' },
];

const CourseWiseDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  const [detailData, setDetailData] = useState<any>(data);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [loader, setLoader] = useState(false);

  const [listReportFacultyApi] = useReportListFacultyMutation();
  const [uploadHonorariumApi] = useReportUploadHonorariumMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Faculty Course Wise Details');
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const getValue = (key: string) => {
    const value = detailData?.[key];
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return value;
  };

  const fetchUpdatedRecord = () => {
    const payload = {
      search: '',
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filters: [['id', '=', detailData?.id]],
      pageNo: 1,
      itemsPerPage: 10,
      exportFlag: false,
      exportFlagPaymentVoucherForMultipleClass: false,
      exportFlagPaymentVoucher: false,
    };

    listReportFacultyApi(payload)
      .unwrap()
      .then((res: any) => {
        const list = res?.data?.data ?? [];
        const updatedItem = list.find(
          (item: any) => item.id === detailData?.id,
        );

        if (updatedItem) {
          setDetailData(updatedItem);
        }
      })
      .catch(() => {});
  };

  const downloadHonorarium = () => {
    const payload = {
      search: '',
      sort: {
        attributes: ['createdAt'],
        sorts: ['desc'],
      },
      filters: [['id', '=', detailData?.id]],
      pageNo: 1,
      itemsPerPage: 10,
      exportFlag: false,
      exportFlagPaymentVoucherForMultipleClass: false,
      exportFlagPaymentVoucher: true,
    };

    setLoader(true);

    listReportFacultyApi(payload)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        const pdfUrl = res?.data?.exportUrlPdfPaymentVoucher;

        if (pdfUrl) {
          downloadAndOpenFile(pdfUrl);
        } else {
          Toast.show({
            type: 'error',
            text2: 'Honorarium PDF not found',
          });
        }
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const handleFileUpload = async () => {
    try {
      const result = await pick({
        type: ['application/pdf', 'image/*'],
        allowMultiSelection: false,
      });

      if (result?.[0]) {
        const file = result[0];

        const MAX_SIZE = 3 * 1024 * 1024;
        if (file.size && file.size > MAX_SIZE) {
          Toast.show({
            type: 'error',
            text2: strings.file_size_exceeded,
          });
          return;
        }

        const fileData = {
          uri: file.uri,
          name: file.name,
          type: file.type,
          size: file.size || 0,
        };

        setSelectedFile(fileData);

        Toast.show({
          type: 'success',
          text2: `${file.name} ${strings.file_selected}`,
        });
      }
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') return;

      Toast.show({
        type: 'error',
        text2: strings.file_pick_failed,
      });
    }
  };

  const uploadHonorarium = () => {
    if (!selectedFile) {
      Toast.show({
        type: 'error',
        text2: 'Please select a file',
      });
      return;
    }

    const formData = new FormData();
    formData.append('id', detailData?.id);
    formData.append('file', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.type,
    });

    setLoader(true);

    uploadHonorariumApi(formData)
      .unwrap()
      .then(() => {
        Toast.show({
          type: 'success',
          text2: 'Honorarium uploaded successfully',
        });

        setSelectedFile(null);

        // 🔥 refresh list & update UI
        fetchUpdatedRecord();

        setLoader(false);
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Upload failed',
        });
      });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FullscreenLoading isVisible={loader} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {FIELDS.map((item, index) => (
            <ViewAtom key={`${index.toString()}-field`} style={styles.row}>
              <TextAtom style={styles.label}>{item.label}</TextAtom>
              <TextAtom style={styles.value}>{getValue(item.key)}</TextAtom>
            </ViewAtom>
          ))}

          <ViewAtom style={styles.actionRow}>
            <TextAtom style={styles.label}>View Verified Honorarium</TextAtom>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(detailData.honorariumPaymentLetterUrl)
              }
            >
              <TextAtom style={styles.link}>
                {data?.honorariumPaymentLetterUrl ? 'View' : '-'}
              </TextAtom>
            </TouchableOpacity>
          </ViewAtom>

          <ViewAtom style={styles.actionRow}>
            <TextAtom style={styles.label}>Download Honorarium</TextAtom>
            <TouchableOpacity onPress={downloadHonorarium}>
              <TextAtom style={styles.link}>Download</TextAtom>
            </TouchableOpacity>
          </ViewAtom>

          <ViewAtom style={styles.actionRow}>
            <TextAtom style={styles.label}>
              {detailData?.honorariumPaymentLetterUrl
                ? 'Re-Upload Honorarium'
                : 'Upload Honorarium'}
            </TextAtom>

            <TouchableOpacity onPress={handleFileUpload}>
              <TextAtom style={styles.link}>Choose File</TextAtom>
            </TouchableOpacity>
          </ViewAtom>

          {selectedFile && (
            <ViewAtom style={styles.fileBox}>
              <TextAtom numberOfLines={1} style={styles.fileName}>
                {selectedFile.name}
              </TextAtom>

              <TouchableOpacity onPress={uploadHonorarium}>
                <TextAtom style={styles.uploadBtn}>
                  {detailData?.honorariumPaymentLetterUrl
                    ? 'Re-Upload'
                    : 'Upload'}
                </TextAtom>
              </TouchableOpacity>
            </ViewAtom>
          )}
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseWiseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  scrollContainer: {
    paddingHorizontal: vw(15),
    paddingBottom: vh(30),
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
    marginBottom: vh(12),
  },

  label: {
    flex: 1,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.black,
  },

  value: {
    flex: 1,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(14),
    color: colors.grey,
    textAlign: 'right',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vh(10),
  },

  link: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.primary,
  },

  fileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vh(8),
  },

  fileName: {
    flex: 1,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(13),
    color: colors.grey,
    marginRight: vw(10),
  },

  uploadBtn: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
    color: colors.primary,
  },
});
