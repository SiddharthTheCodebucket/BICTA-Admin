import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  vh,
  vw,
  strings,
  images,
} from '../../../../../../constants';
import { Header } from '../../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';
import TouchableAtom from '../../../../../../components/atoms/TouchableAtom';
import ImageAtom from '../../../../../../components/atoms/ImageAtom';

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

const FacultyDetailDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

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

  const facultyStrings = strings.lms.facultyManagement.details;

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <TouchableAtom
          style={styles.titleRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <ImageAtom source={images.arrow_back} style={styles.inlineBackIcon} />
          <TextAtom style={styles.pageTitle}>{'Create Category'}</TextAtom>
        </TouchableAtom>

        <ViewAtom style={styles.card}>
          {/* BASIC DETAILS */}
          <FieldRow
            label={facultyStrings.facultyUID}
            value={data?.facultyUniqueId}
          />
          <FieldRow label={facultyStrings.facultyId} value={data?.facultyId} />
          <FieldRow
            label={facultyStrings.facultyType}
            value={data?.facultyType}
          />
          <FieldRow
            label={facultyStrings.facultyOrganisation}
            value={data?.facultyOrganisation}
          />

          {/* PERSONAL */}
          <FieldRow
            label={facultyStrings.name}
            value={`${data?.salutationName || ''} ${data?.facultyName || ''}`}
          />
          <FieldRow
            label={facultyStrings.designation}
            value={data?.designation}
          />
          <FieldRow
            label={facultyStrings.department}
            value={data?.department}
          />
          <FieldRow label={facultyStrings.email} value={data?.emailId} />
          <FieldRow
            label={facultyStrings.mobileNumber}
            value={data?.mobileNo}
          />

          {/* LOCATION */}
          <FieldRow label={facultyStrings.state} value={data?.state} />
          {data?.state === facultyStrings.outsideBihar && (
            <FieldRow
              label={facultyStrings.outsideBiharState}
              value={data?.outsideBiharState}
            />
          )}

          {/* PAY DETAILS */}
          <FieldRow label={facultyStrings.payLevel} value={data?.payLevel} />
          <FieldRow
            label={facultyStrings.remuneration}
            value={data?.remuneration}
          />
          <FieldRow label={facultyStrings.category} value={data?.category} />

          {/* STATUS & BLOCK */}
          <FieldRow label={facultyStrings.status} value={data?.status} />
          <FieldRow
            label={facultyStrings.blockUnblock}
            value={data?.isBlacklisted}
          />

          {/* BANK & PAN DETAILS */}
          <FieldRow label={facultyStrings.pan} value={data?.pan} />
          <FieldRow label={facultyStrings.bankName} value={data?.bankName} />
          <FieldRow
            label={facultyStrings.branchName}
            value={data?.branchName}
          />
          <FieldRow
            label={facultyStrings.accountHolder}
            value={data?.accountHolderName}
          />
          <FieldRow label={facultyStrings.accountNo} value={data?.accountNo} />
          <FieldRow label={facultyStrings.ifscCode} value={data?.ifscCode} />

          <FullWidthField
            label={facultyStrings.expertise}
            value={data?.expertise}
          />

          <FieldRow
            label={facultyStrings.createdBy}
            value={data?.createdBy?.name}
          />
          <FieldRow
            label={facultyStrings.updatedBy}
            value={data?.updatedBy?.name}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyDetailDetails;

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: vh(10),
  },
  inlineBackIcon: {
    width: vw(18),
    height: vw(18),
    tintColor: colors.new_ui_heading,
    marginRight: vw(8),
  },
  pageTitle: {
    fontFamily: fonts.Inter_SemiBold,
    fontSize: vw(16),
    lineHeight: 24,
    color: colors.text_black,
  },
  container: { flex: 1, backgroundColor: colors.backgroundColor },

  scrollContainer: { paddingBottom: vh(40), paddingHorizontal: vw(12) },

  card: {
    backgroundColor: colors.white,
    borderRadius: vw(10),
    padding: vw(16),
    marginTop: vh(15),
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
