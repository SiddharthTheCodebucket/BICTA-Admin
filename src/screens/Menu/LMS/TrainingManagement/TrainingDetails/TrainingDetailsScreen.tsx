import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, vh, vw } from '../../../../../constants';
import { Header } from '../../../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../../../components/atoms/TextAtom';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
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

const ImageField = ({ label, uri, onPress }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>

    {uri ? (
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{ uri }}
          style={{ width: '100%', height: vh(120), borderRadius: vw(8) }}
          resizeMode="contain"
        />
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.fullValue}>-</TextAtom>
    )}
  </ViewAtom>
);

const TrainingDetailsScreen = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Training Details');
    navigation.BackButtonPress = () => navigation.goBack();
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          {/* Training Category */}
          <FullWidthField
            label="Training Category"
            value={data?.trainingCategory}
          />

          {/* Training Programme Name */}
          <FullWidthField
            label="Training Full Name"
            value={data?.trainingFullName}
          />

          <FieldRow
            label="Training Short Name"
            value={data?.trainingShortName}
          />

          <FieldRow
            label="Course Start Date"
            value={
              data?.courseStartDate
                ? moment(data.courseStartDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FieldRow
            label="Course End Date"
            value={
              data?.courseEndDate
                ? moment(data.courseEndDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FieldRow
            label="No. of Participants"
            value={data?.noOfParticipants}
          />

          <FieldRow
            label="Total Registration"
            value={data?.totalRegisteredTrainees}
          />

          <FieldRow label="Sections / Batches" value={data?.noOfSections} />
          <FieldRow label="File No" value={data?.fileNo} />
          <FieldRow
            label="Course Coordinator"
            value={data?.courseCoordinator}
          />

          <FieldRow
            label="Young Professional"
            value={data?.youngProfessional}
          />

          <FieldRow label="Is Login Allowed" value={data?.isLoginAllowed} />

          <FieldRow label="Is Course Active" value={data?.isCourseActive} />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrainingDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundColor },

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
});
