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

const ApplicationDetails = ({ route, navigation }: any) => {
  const { data } = route.params || {};

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.hostelManagement.hostelAllocation.allocationDetails,
    );
    navigation.BackButtonPress = () => navigation.goBack();
  });

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <ViewAtom style={styles.card}>
          <FieldRow
            label={'Application Date'}
            value={
              data?.createdAt
                ? moment(data.createdAt).format('DD-MM-YYYY')
                : '-'
            }
          />

          <FullWidthField label={'Training Name'} value={data?.trainingName} />

          <FullWidthField label={'Trainee Name'} value={data?.traineeName} />
          <FullWidthField label={'Category'} value={data?.category} />
          <FullWidthField label={'Title'} value={data?.title} />

          <FieldRow
            label={'From Date'}
            value={
              data?.dateFrom ? moment(data.dateFrom).format('DD-MM-YYYY') : '-'
            }
          />

          <FieldRow
            label={'To Date'}
            value={
              data?.dateTo ? moment(data.dateTo).format('DD-MM-YYYY') : '-'
            }
          />

          <FieldRow label={'Status'} value={data?.applicationStatus} />
          <FullWidthField label={'Description'} value={data?.description} />

          <FullWidthField label={'Remarks'} value={data?.remarks} />

          <ImageField
            label={'View Uploaded File'}
            uri={data?.userUploadedFile}
            onPress={() => {}}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ApplicationDetails;

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
