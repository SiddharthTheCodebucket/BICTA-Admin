import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  adminFontSizes,
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import Toast from 'react-native-toast-message';
import { useUpdateFacultyConfirmationMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import { FormSwitchWithTitle } from '../../../../../../components/templates';

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

const FacultyConfirmationDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};
  const [updateFacultyConfirmationApi] = useUpdateFacultyConfirmationMutation();

  const initialStatus =
    data?.classConfirmation === null
      ? strings.no
      : data?.classConfirmation
      ? strings.yes
      : strings.no;

  const [statusValue, setStatusValue] = useState(initialStatus);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.facultyManagement.main.title,
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
    );
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, [navigation]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.facultyManagement.confirmation.detailsTitle,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  const onSelectStatus = (newStatus: string) => {
    if (newStatus === statusValue) return;

    navigation.navigate(screensName.AlertOrganism, {
      title: strings.lms.facultyManagement.confirmation.statusChangeConf,
      message: strings.lms.facultyManagement.confirmation.statusChangeMsg,
      okText: strings.lms.facultyManagement.confirmation.confirm,
      double: true,
      cancelText: strings.lms.facultyManagement.confirmation.cancel,
      okFunction: () => updateStatus(data?.id, newStatus),
      cancelFunction: () => {},
    });
  };

  const updateStatus = (id: any, status: string) => {
    const params = { class_confirmation: status, id };
    updateFacultyConfirmationApi(params)
      .unwrap()
      .then((res: any) => {
        setStatusValue(status);
        Toast.show({ type: 'success', text2: res.data?.message });
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err.data?.message || strings.something_went_wrong,
        });
      });
  };

  const displayName = data?.facultyName ?? '-';
  const avatarLetter = `${displayName}`.trim().charAt(0).toUpperCase() || 'F';

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              <TextAtom style={styles.avatarLetter}>{avatarLetter}</TextAtom>
            </View>
            <View style={styles.profileInfo}>
              <TextAtom style={styles.profileName}>{displayName}</TextAtom>
            </View>
          </View>

          <FullWidthField
            label={strings.lms.facultyManagement.confirmation.facultyName}
            value={data?.facultyName}
          />

          <FullWidthField
            label={strings.lms.facultyManagement.confirmation.trainingName}
            value={data?.trainingName}
          />

          <FullWidthField
            label={strings.lms.facultyManagement.confirmation.subject}
            value={data?.subject}
          />

          <FullWidthField
            label={strings.lms.facultyManagement.confirmation.topic}
            value={data?.topic}
          />

          <FieldRow
            label={strings.lms.facultyManagement.confirmation.classDate}
            value={
              data?.classDate
                ? moment(data?.classDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FieldRow
            label={strings.lms.facultyManagement.confirmation.sessionTime}
            value={data?.sessionTime}
          />

          <FullWidthField
            label={strings.lms.facultyManagement.confirmation.email}
            value={data?.email || '-'}
          />

          <FieldRow
            label={strings.lms.facultyManagement.confirmation.mobileNumber}
            value={data?.mobileNumber || '-'}
          />

          <FieldRow
            label={strings.lms.facultyManagement.confirmation.classApproved}
            value={
              data?.isApproved === null
                ? '-'
                : data?.isApproved
                ? strings.yes
                : strings.no
            }
          />

          {/* <View style={styles.confirmationSection}>
            <TextAtom style={styles.sectionTitle}>
              {strings.lms.facultyManagement.confirmation.classConfirmation}
            </TextAtom>
            <View style={styles.classToggle}>
              <TouchableAtom
                style={[
                  styles.toggleBtn,
                  statusValue === strings.yes && styles.toggleBtnActive,
                ]}
                onPress={() => onSelectStatus(strings.yes)}
              >
                <TextAtom
                  style={[
                    styles.toggleText,
                    statusValue === strings.yes && styles.toggleTextActive,
                  ]}
                >
                  {strings.yes}
                </TextAtom>
              </TouchableAtom>
              <TouchableAtom
                style={[
                  styles.toggleBtn,
                  statusValue === strings.no && styles.toggleBtnActive,
                ]}
                onPress={() => onSelectStatus(strings.no)}
              >
                <TextAtom
                  style={[
                    styles.toggleText,
                    statusValue === strings.no && styles.toggleTextActive,
                  ]}
                >
                  {strings.no}
                </TextAtom>
              </TouchableAtom>
            </View>
          </View> */}

          <FormSwitchWithTitle
            title={strings.lms.facultyManagement.confirmation.class}
            data={[
              { id: strings.yes, label: strings.yes },
              { id: strings.no, label: strings.no },
            ]}
            selectedValue={statusValue}
            onSelect={item => {
              onSelectStatus(item?.id);
            }}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyConfirmationDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },

  scrollContainer: { paddingBottom: vh(40), paddingHorizontal: vw(15) },

  card: {
    backgroundColor: colors.new_ui_card_bg,
    borderRadius: vw(10),
    padding: vw(15),
    marginTop: vh(15),
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vw(10),
    marginBottom: vh(12),
  },
  avatarCircle: {
    width: vw(36),
    height: vw(36),
    borderRadius: vw(18),
    backgroundColor: colors.primary_sky_blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.text_black,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.md,
    color: colors.new_ui_card_title,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vh(10),
  },

  label: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.text_black,
    flex: 1,
  },

  value: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_card_description,
    flex: 1,
    textAlign: 'right',
  },

  fullWidthBox: { marginBottom: vh(12) },

  fullLabel: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.text_black,
    marginBottom: vh(5),
  },

  fullValue: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: adminFontSizes.sm,
    color: colors.new_ui_card_description,
  },
  confirmationSection: { marginTop: vh(6) },
  sectionTitle: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.sm,
    color: colors.text_black,
    marginBottom: vh(8),
  },
  classToggle: {
    flexDirection: 'row',
    borderRadius: vw(8),
    overflow: 'hidden',
    borderWidth: vw(1),
    borderColor: colors.new_ui_card_border,
    alignSelf: 'flex-start',
  },
  toggleBtn: {
    paddingHorizontal: vw(12),
    paddingVertical: vh(6),
    backgroundColor: colors.white,
  },
  toggleBtnActive: { backgroundColor: colors.primary_blue },
  toggleText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: adminFontSizes.xs,
    color: colors.new_ui_card_description,
  },
  toggleTextActive: { color: colors.white },
});
