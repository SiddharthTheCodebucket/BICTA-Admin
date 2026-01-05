import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, strings, vh, vw } from '../../../../../../constants';
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

const ImageField = ({ label, uri, onPress }: any) => (
  <ViewAtom style={styles.fullWidthBox}>
    <TextAtom style={styles.fullLabel}>{label}</TextAtom>

    {uri ? (
      <TouchableOpacity onPress={onPress}>
        <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      </TouchableOpacity>
    ) : (
      <TextAtom style={styles.fullValue}>-</TextAtom>
    )}
  </ViewAtom>
);

const HostelAllocationDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelAllocation.allocationDetails,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  let trainingProgrammeValue: any = '-';

  if (data?.nameOfTrainingProgramme) {
    trainingProgrammeValue = data.nameOfTrainingProgramme;

    if (data?.nameOfTrainingProgrammeId) {
      trainingProgrammeValue += ` (${data.nameOfTrainingProgrammeId})`;
    }
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FullWidthField
            label={strings.hostelManagement.hostelAllocation.trainingProgramme}
            value={trainingProgrammeValue}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.courseStartDate}
            value={
              data?.courseStartDate
                ? moment(data.courseStartDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.courseEndDate}
            value={
              data?.courseEndDate
                ? moment(data.courseEndDate).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FullWidthField
            label={strings.hostelManagement.hostelAllocation.name}
            value={data?.name}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.aadhaarNumber}
            value={data?.aadhaarNo}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocation.panNumber}
            value={data?.panNo}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocation.gender}
            value={data?.gender}
          />

          <FullWidthField
            label={strings.hostelManagement.hostelAllocation.email}
            value={data?.officeEmail}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.mobileNumber}
            value={data?.mobileNo}
          />

          <FullWidthField
            label={strings.hostelManagement.hostelAllocation.department}
            value={data?.department}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.hostel}
            value={data?.hostelName}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocation.room}
            value={data?.roomNo}
          />
          <FieldRow
            label={strings.hostelManagement.hostelAllocation.bed}
            value={data?.bedName}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.noOfDays}
            value={data?.noOfDays}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.key}
            value={data?.keyProvided}
          />

          <FieldRow
            label={strings.hostelManagement.hostelAllocation.yogaMat}
            value={data?.yogaMatProvided}
          />

          <ImageField
            label={strings.hostelManagement.hostelAllocation.photo}
            uri={data?.photo}
            onPress={() => {}}
          />

          <ImageField
            label={strings.hostelManagement.hostelAllocation.signature}
            uri={data?.sign}
            onPress={() => {}}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HostelAllocationDetails;

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
  image: {
    width: '100%',
    height: vh(120),
    borderRadius: vw(8),
  },
});
