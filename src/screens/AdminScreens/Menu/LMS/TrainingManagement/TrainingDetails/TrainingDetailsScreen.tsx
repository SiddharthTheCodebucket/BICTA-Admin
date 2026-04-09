import React, { useLayoutEffect } from 'react';
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  adminFontSizes,
  colors,
  fonts,
  images,
  screensName,
  strings,
  SvgDownload,
  vh,
  vw,
} from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { useDeleteTrainingDetailsMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import { globalStyles } from '../../../../../../utils/globalStyles';

const InfoBlock = ({ label, value, alignRight }: any) => (
  <View style={[styles.infoBlock, alignRight && styles.infoBlockRight]}>
    <TextAtom style={styles.infoLabel}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.infoValue}>
      {value || '-'}
    </TextAtom>
  </View>
);

const TrainingDetailsScreen = ({ route, navigation }: any) => {
  const { data, onDone } = route.params || {};
  const [deleteTrainingDetailsApi] = useDeleteTrainingDetailsMutation();
  const [loading, setLoading] = React.useState(false);

  const locationRaw =
    data?.isLocationRequired ??
    data?.locationRequired ??
    data?.isCourseLocationRequired ??
    data?.locationRequiredForCourse;

  const isLocationRequired =
    locationRaw === true ||
    locationRaw === 1 ||
    String(locationRaw).toLowerCase() === 'yes';

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Training Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const confirmDelete = () => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this item?',
      okText: 'Confirm',
      double: true,
      cancelText: strings.cancel,
      okFunction: () => deleteTrainingDetails(),
      cancelFunction: () => {},
    });
  };

  const deleteTrainingDetails = () => {
    if (!data?.id) return;
    setLoading(true);

    deleteTrainingDetailsApi({ course_id: data.id })
      .unwrap()
      .then((res: any) => {
        Toast.show({
          type: 'success',
          text2: res?.data?.message ?? 'Deleted',
        });
        onDone?.();
        navigation.goBack();
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Something went wrong',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loading} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <TextAtom numberOfLines={2} style={styles.cardTitle}>
            {data?.trainingCategory || '-'}
          </TextAtom>

          <TextAtom style={styles.kvLabel}>Name:</TextAtom>
          <TextAtom numberOfLines={0} style={styles.kvValue}>
            {data?.trainingFullName || '-'}
          </TextAtom>

          <View style={styles.gridRow}>
            <InfoBlock
              label="Start Date"
              value={
                data?.courseStartDate
                  ? moment(data.courseStartDate).format('DD-MM-YYYY')
                  : '-'
              }
            />
            <InfoBlock
              label="End Date"
              value={
                data?.courseEndDate
                  ? moment(data.courseEndDate).format('DD-MM-YYYY')
                  : '-'
              }
            />
          </View>

          <View style={styles.gridRow}>
            <InfoBlock
              label="No Of Participants"
              value={data?.noOfParticipants}
            />
            <InfoBlock
              label="Total Registration"
              value={data?.totalRegisteredTrainees}
            />
          </View>

          <View style={styles.gridRow}>
            <InfoBlock label="Section Batches" value={data?.noOfSections} />
            <InfoBlock label="File No." value={data?.fileNo} />
          </View>

          <View style={styles.gridRow}>
            <InfoBlock
              label="Course Coordinator"
              value={data?.courseCoordinator}
            />
            <InfoBlock
              label="Young Professional"
              value={data?.youngProfessional}
            />
          </View>

          <View style={styles.gridRow}>
            <InfoBlock label="Login Allowed" value={data?.isLoginAllowed} />
            <View style={[styles.infoBlock]}>
              <TextAtom style={styles.infoLabel}>Location Required</TextAtom>
              <View style={globalStyles.switchPillRow}>
                <View
                  style={[
                    globalStyles.switchPill,
                    isLocationRequired
                      ? globalStyles.switchPillActive
                      : globalStyles.switchPillInactive,
                  ]}
                >
                  <TextAtom
                    style={[
                      globalStyles.switchPillText,
                      isLocationRequired
                        ? globalStyles.switchPillTextActive
                        : globalStyles.switchPillTextInactive,
                    ]}
                  >
                    Yes
                  </TextAtom>
                </View>
                <View
                  style={[
                    globalStyles.switchPill,
                    !isLocationRequired
                      ? globalStyles.switchPillActive
                      : globalStyles.switchPillInactive,
                  ]}
                >
                  <TextAtom
                    style={[
                      globalStyles.switchPillText,
                      !isLocationRequired
                        ? globalStyles.switchPillTextActive
                        : globalStyles.switchPillTextInactive,
                    ]}
                  >
                    No
                  </TextAtom>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.qrRow}>
            <View style={{ flex: 1, paddingRight: vw(11) }}>
              <TextAtom style={styles.infoLabel}>Registration QR</TextAtom>
              <TouchableAtom
                style={globalStyles.createButtonTouchable}
                onPress={() => {}}
              >
                <ImageBackground
                  source={images.gradBtnGenrateQR}
                  style={globalStyles.createButton}
                  imageStyle={globalStyles.createButtonImage}
                  resizeMode="stretch"
                >
                  <TextAtom style={{ fontSize: 11, lineHeight: 15 }}>
                    Generate Emergency QR
                  </TextAtom>
                </ImageBackground>
              </TouchableAtom>
            </View>

            <View style={{ flex: 1 }}>
              <TextAtom style={styles.infoLabel}>Extend</TextAtom>
              <TouchableAtom style={{ marginLeft: 6 }} onPress={() => {}}>
                <SvgDownload />
              </TouchableAtom>
            </View>
          </View>
        </ViewAtom>
      </ScrollView>

      <View style={styles.footerRow}>
        <TouchableAtom style={styles.deleteBtn} onPress={confirmDelete}>
          <TextAtom style={styles.deleteText}>Delete</TextAtom>
        </TouchableAtom>
        <TouchableAtom
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate(screensName.AddTrainingDetails, { item: data })
          }
        >
          <TextAtom style={styles.editText}>Edit</TextAtom>
        </TouchableAtom>
      </View>
    </SafeAreaView>
  );
};

export default TrainingDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.new_ui_screen_bg },

  scrollContainer: {
    paddingBottom: vh(90),
    paddingHorizontal: vw(14),
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: vw(12),
    padding: vw(14),
    marginTop: vh(15),
    elevation: 2,
  },
  cardTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_heading,
    marginBottom: vh(8),
  },
  kvLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
    color: '#7A818B',
  },
  kvValue: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
    marginBottom: vh(10),
  },

  gridRow: {
    flexDirection: 'row',
    marginTop: vh(10),
  },
  infoBlock: {
    flex: 1,
    paddingRight: vw(10),
  },
  infoBlockRight: {
    alignItems: 'flex-end',
    paddingRight: 0,
  },
  infoLabel: {
    fontFamily: fonts.Inter_Regular,
    fontSize: adminFontSizes.xs,
    color: '#7A818B',
    marginBottom: vh(2),
  },
  infoValue: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
  },

  pillRow: {
    flexDirection: 'row',
    marginTop: vh(2),
  },
  pill: {
    minWidth: vw(28),
    height: vh(22),
    borderRadius: vw(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw(6),
    paddingHorizontal: vw(8),
  },
  pillActive: {
    backgroundColor: colors.primary_blue,
  },
  pillInactive: {
    backgroundColor: '#CFE2F7',
  },
  pillText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.xs,
  },
  pillTextActive: {
    color: colors.white,
  },
  pillTextInactive: {
    color: '#23406A',
  },

  qrRow: {
    flexDirection: 'row',
    marginTop: vh(14),
    // alignItems: 'flex-end',
  },
  qrButton: {
    marginTop: vh(6),
    height: vh(32),
    borderRadius: vw(10),
    backgroundColor: colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: adminFontSizes.xs,
    color: colors.white,
  },

  footerRow: {
    position: 'absolute',
    left: vw(14),
    right: vw(14),
    bottom: vh(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteBtn: {
    flex: 1,
    height: vh(44),
    borderRadius: vw(12),
    borderWidth: 1,
    borderColor: '#C9D3E1',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: vw(10),
  },
  deleteText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: '#2F3742',
  },
  editBtn: {
    flex: 1,
    height: vh(44),
    borderRadius: vw(12),
    backgroundColor: colors.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: vw(10),
  },
  editText: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: adminFontSizes.sm,
    color: colors.white,
  },
});
