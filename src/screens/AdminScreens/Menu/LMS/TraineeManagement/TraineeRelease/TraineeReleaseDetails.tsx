import React, { useLayoutEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import {
  colors,
  fonts,
  screensName,
  vh,
  vw,
} from '../../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import {
  downloadAndOpenFile,
  isNullUndefined,
} from '../../../../../../utils/CommonFunction';
import { useDownloadTraineeDetailsMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import { FormFieldWrapper } from '../../../../../../components/templates';

interface Props {
  route: any;
  navigation: NavigationType;
}

const DetailRow = ({ left, right }: any) => (
  <View style={styles.detailRow}>
    <View style={styles.detailCol}>
      <TextAtom style={styles.label}>{left?.label}</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {left?.value || '-'}
      </TextAtom>
    </View>
    <View style={styles.detailCol}>
      <TextAtom style={styles.label}>{right?.label}</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {right?.value || '-'}
      </TextAtom>
    </View>
  </View>
);

const FullWidthField = ({ label, value }: any) => (
  <View style={styles.fullWidthField}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value || 'N/A'}
    </TextAtom>
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <TextAtom style={styles.sectionTitle}>{title}</TextAtom>
);

const TraineeReleaseDetails = ({ route, navigation }: Props) => {
  const { data } = route.params || {};
  const [downloadTraineeDetailsApi] = useDownloadTraineeDetailsMutation();
  const [loader, setLoader] = useState(false);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Trainee Management',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  }, [navigation]);

  const formatDate = (value: any) =>
    value ? moment(value).format('DD/MM/YYYY') : 'N/A';

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar) return 'N/A';
    return `XXXX XXXX ${aadhaar.slice(-4)}`;
  };

  const downloadDetails = () => {
    setLoader(true);
    downloadTraineeDetailsApi({
      trainee: [data],
    })
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        const fileUrl = res?.data?.fileUrl;
        if (fileUrl) {
          downloadAndOpenFile(fileUrl);
          return;
        }

        Toast.show({
          type: 'error',
          text2: 'No downloadable file found',
        });
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      });
  };

  const openReleaseAttachment = async () => {
    const fileUrl =
      data?.releasedAttachment ||
      data?.releaseAttachment ||
      data?.attachment ||
      data?.file ||
      data?.fileUrl;

    if (!fileUrl) {
      Toast.show({
        type: 'error',
        text2: 'No file available',
      });
      return;
    }

    try {
      await Linking.openURL(fileUrl);
    } catch {
      Toast.show({
        type: 'error',
        text2: 'Unable to open file',
      });
    }
  };

  const handleRelease = () => {
    if (String(data?.isReleased).toLowerCase() === 'yes') {
      Toast.show({
        type: 'success',
        text2: 'Trainee is already released',
      });
      return;
    }

    navigation.navigate(screensName.TraineeReleaseForm, {
      item: data,
      onDone: () => navigation.goBack(),
    });
  };

  const createdByValue =
    data?.updatedBy?.name || data?.createdBy?.name || data?.department || 'N/A';

  const indemnityValue =
    String(data?.isTraineeIndemnityBondSubmitted).toLowerCase() === 'yes'
      ? 'Bond'
      : 'N/A';

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ marginTop: vh(16) }}>
          <FormFieldWrapper>
            <View style={styles.outerCard}>
              {/* <View style={styles.innerCard}> */}
              <View style={styles.profileHeader}>
                <View style={styles.initialCircle}>
                  <TextAtom style={styles.initialText}>
                    {data?.name?.[0] || 'R'}
                  </TextAtom>
                </View>

                <View style={styles.profileTextBlock}>
                  <TextAtom style={styles.profileName}>
                    {data?.name || 'N/A'}
                  </TextAtom>
                  <View style={styles.trainingBadge}>
                    <TextAtom style={styles.trainingBadgeText}>
                      {`Training Id - ${data?.traineeId || 'N/A'}`}
                    </TextAtom>
                  </View>
                </View>
              </View>

              <SectionTitle title="Personal Details" />
              <DetailRow
                left={{ label: 'Name', value: data?.name }}
                right={{ label: 'Father Name', value: data?.fatherName }}
              />
              <DetailRow
                left={{ label: 'Mother Name', value: data?.motherName }}
                right={{ label: 'DOB', value: formatDate(data?.dob) }}
              />
              <DetailRow
                left={{ label: 'Marital Status', value: data?.maritalStatus }}
                right={{ label: 'Gender', value: data?.gender }}
              />
              <DetailRow
                left={{ label: 'Designation', value: data?.designation }}
                right={{ label: 'Mobile No', value: data?.mobileNo }}
              />
              <DetailRow
                left={{ label: 'PAN No.', value: data?.panNo }}
                right={{
                  label: 'Aadhaar No',
                  value: maskAadhaar(data?.aadhaarNo),
                }}
              />
              <FullWidthField label="Personal Email" value={data?.otherEmail} />

              <SectionTitle title="Other Details" />
              <FullWidthField
                label="Official Email"
                value={data?.officeEmail}
              />
              <FullWidthField
                label="Name Of Training Programme"
                value={data?.nameOfTrainingProgramme}
              />
              <DetailRow
                left={{ label: 'Batch No', value: data?.batchName }}
                right={{ label: 'Category', value: data?.category }}
              />
              <FullWidthField
                label="Course Duration"
                value={
                  !isNullUndefined(data?.courseStartDate) &&
                  !isNullUndefined(data?.courseEndDate)
                    ? `${formatDate(data?.courseStartDate)} to ${formatDate(
                        data?.courseEndDate,
                      )}`
                    : 'N/A'
                }
              />
              <DetailRow
                left={{ label: 'GPF / PRAN', value: data?.gpfOrPran }}
                right={{ label: 'Pay Scale', value: data?.payScale }}
              />
              <FullWidthField
                label="Highest Education Qualification"
                value={data?.educationQualification}
              />
              <DetailRow
                left={{
                  label: 'Basic Pay Scale/Honorarium',
                  value: data?.basicPayScale,
                }}
                right={{ label: 'Department', value: data?.department }}
              />
              <FullWidthField
                label="Office Address"
                value={data?.officeAddress}
              />
              <DetailRow
                left={{
                  label: 'Residential Address',
                  value: data?.residentialAddress,
                }}
                right={{
                  label: 'Previous Work Experience',
                  value: data?.previousWorkExperience,
                }}
              />
              <DetailRow
                left={{
                  label: 'Any Course On Computing',
                  value: data?.attendedOrCompletedAnyOtherTraining,
                }}
                right={{
                  label: 'Knowledge Of Computing',
                  value: data?.knowledgeOfComputing,
                }}
              />
              <DetailRow
                left={{ label: 'Indemnity Bond', value: indemnityValue }}
                right={{ label: 'Created By', value: createdByValue }}
              />
              <DetailRow
                left={{ label: 'Updated By', value: createdByValue }}
                right={{
                  label: 'File',
                  value: data?.releasedAttachment
                    ? ''
                    : data?.releaseAttachment
                    ? ''
                    : data?.attachment
                    ? ''
                    : 'N/A',
                }}
              />

              {(data?.releasedAttachment ||
                data?.releaseAttachment ||
                data?.attachment ||
                data?.file ||
                data?.fileUrl) && (
                <View style={styles.fileButtonRow}>
                  <TouchableAtom
                    style={styles.viewFileBtn}
                    onPress={openReleaseAttachment}
                  >
                    <TextAtom style={styles.viewFileText}>View</TextAtom>
                  </TouchableAtom>
                </View>
              )}

              <SectionTitle title="Release Details" />
              <DetailRow
                left={{
                  label: 'Reason For Release',
                  value: data?.releasedReason,
                }}
                right={{
                  label: 'Remark For Release(If Any)',
                  value: data?.releasedRemark,
                }}
              />
              <FullWidthField
                label="Date of Release"
                value={formatDate(data?.releasedAt)}
              />
              {/* </View> */}
            </View>
          </FormFieldWrapper>
        </View>

        <View style={styles.footerButtons}>
          <TouchableAtom style={styles.downloadBtn} onPress={downloadDetails}>
            <TextAtom style={styles.downloadBtnText}>Download Details</TextAtom>
          </TouchableAtom>
          <TouchableAtom style={styles.releaseBtn} onPress={handleRelease}>
            <TextAtom style={styles.releaseBtnText}>Release</TextAtom>
          </TouchableAtom>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TraineeReleaseDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  topBackRow: {
    paddingHorizontal: vw(18),
    paddingTop: vh(12),
    paddingBottom: vh(4),
  },
  topBackText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(13.5),
    color: '#202632',
  },
  scrollContent: {
    paddingHorizontal: vw(10),
    paddingBottom: vh(20),
  },
  outerCard: {
    backgroundColor: colors.backgroundColor,
    borderRadius: vw(8),
    padding: vw(8),
  },
  innerCard: {
    backgroundColor: colors.white,
    borderRadius: vw(14),
    paddingHorizontal: vw(14),
    paddingVertical: vh(14),
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vh(16),
  },
  initialCircle: {
    width: vw(34),
    height: vw(34),
    borderRadius: vw(17),
    backgroundColor: '#E4EFFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(10),
  },
  initialText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(16),
    color: '#41658E',
  },
  profileTextBlock: {
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(15.5),
    color: '#232A34',
  },
  trainingBadge: {
    alignSelf: 'flex-start',
    marginTop: vh(5),
    backgroundColor: '#EAF1F8',
    borderRadius: vw(4),
    paddingHorizontal: vw(7),
    paddingVertical: vh(3),
  },
  trainingBadgeText: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(10),
    color: '#5F7391',
  },
  sectionTitle: {
    marginBottom: vh(10),
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    color: '#244D7A',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: vh(12),
  },
  detailCol: {
    flex: 1,
    paddingRight: vw(10),
  },
  fullWidthField: {
    marginBottom: vh(12),
  },
  label: {
    fontFamily: fonts.Inter_Regular,
    fontSize: vw(12.5),
    color: '#7A7D82',
    marginBottom: vh(4),
  },
  value: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(13.8),
    color: '#2E3034',
    lineHeight: vw(18),
  },
  fileButtonRow: {
    alignItems: 'flex-end',
    marginTop: vh(-8),
    marginBottom: vh(12),
  },
  viewFileBtn: {
    backgroundColor: colors.primary_dark_blue,
    borderRadius: vw(4),
    paddingHorizontal: vw(10),
    paddingVertical: vh(4),
  },
  viewFileText: {
    color: colors.white,
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(10),
    paddingHorizontal: vw(6),
    paddingTop: vh(10),
    paddingBottom: vh(12),
    backgroundColor: colors.backgroundColor,
  },
  downloadBtn: {
    flex: 1,
    height: vh(46),
    borderRadius: vw(10),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#1E2330',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: '#1E2330',
    fontSize: vw(16),
    fontFamily: fonts.Inter_Medium,
  },
  releaseBtn: {
    flex: 1,
    height: vh(46),
    borderRadius: vw(10),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#FF5B52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  releaseBtnText: {
    color: '#FF4B43',
    fontSize: vw(16),
    fontFamily: fonts.Inter_Medium,
  },
});
