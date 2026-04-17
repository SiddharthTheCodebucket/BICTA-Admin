import React, { useLayoutEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import moment from 'moment';
import { globalStyles } from '../../../../../../utils/globalStyles/GlobalStyles';
import {
  FormWhiteButton,
  FormGradientButton,
} from '../../../../../../components/templates';

interface Props {
  route: any;
  navigation: NavigationType;
}

const InfoField = ({ label, value }: any) => (
  <ViewAtom style={globalStyles.infoCol}>
    <TextAtom style={styles.label}>{label}</TextAtom>
    <TextAtom numberOfLines={0} style={styles.value}>
      {value || '-'}
    </TextAtom>
  </ViewAtom>
);

const FullWidthField = ({ label, value }: any) => (
  <ViewAtom style={globalStyles.infoRow}>
    <ViewAtom style={{ flex: 1 }}>
      <TextAtom style={styles.label}>{label}</TextAtom>
      <TextAtom numberOfLines={0} style={styles.value}>
        {value || '-'}
      </TextAtom>
    </ViewAtom>
  </ViewAtom>
);

const TraineeRegistrationDetails = ({ route, navigation }: Props) => {
  const { data } = route.params || {};

  const navigateToRegistrationList = () => {
    navigation.navigate(screensName.TraineeManagement, {
      initialTab: 'TraineeRegistration',
    });
  };

  const handleEdit = () => {
    navigation.navigate(screensName.AddTraineeRegistration, {
      item: data,
    });
  };

  const handleDelete = () => {
    navigation.navigate(screensName.AlertOrganism, {
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this item?',
      okText: 'Confirm',
      double: true,
      cancelText: 'Cancel',
      okFunction: () => {
        // Add delete API call here
      },
      cancelFunction: () => {},
    });
  };

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Trainee Registration Details');
    navigation.BackButtonPress = () => navigateToRegistrationList();
  }, [navigation]);

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar) return '-';
    const last4 = aadhaar.slice(-4);
    return `XXXX XXXX ${last4}`;
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View
          style={{
            padding: vh(8),
            backgroundColor: colors.white,
            borderRadius: vw(12),
            elevation: 2,
          }}
        >
          <ViewAtom style={styles.card}>
            <TextAtom style={styles.cardTitle}>
              {data?.nameOfTrainingProgramme || 'Course Name'}
            </TextAtom>
            <TextAtom style={styles.cardId}>
              ID: {data?.traineeId || '-'}
            </TextAtom>

            <ViewAtom style={globalStyles.infoRow}>
              <InfoField label="Attendance Code" value={data?.attendanceCode} />
              <InfoField label="User Id" value={data?.userUniqueId} />
            </ViewAtom>

            <ViewAtom style={globalStyles.infoRow}>
              <InfoField label="Training Centre" value={data?.trainingCentre} />
              <InfoField
                label="DOB"
                value={data?.dob ? moment(data?.dob).format('DD-MM-YYYY') : '-'}
              />
            </ViewAtom>

            <ViewAtom style={globalStyles.infoRow}>
              <InfoField label="Blood Group" value={data?.bloodGroup} />
              <InfoField
                label="Aadhaar No"
                value={maskAadhaar(data?.aadhaarNo)}
              />
            </ViewAtom>

            <FullWidthField label="Email" value={data?.officeEmail} />

            <ViewAtom style={globalStyles.infoRow}>
              <InfoField label="Mobile Number" value={data?.mobileNo} />
              <InfoField label="Designation" value={data?.designation} />
            </ViewAtom>

            <ViewAtom style={globalStyles.infoRow}>
              <InfoField
                label="Place Of Posting"
                value={data?.placeOfPosting}
              />
              <InfoField label="Gender" value={data?.gender} />
            </ViewAtom>

            <ViewAtom style={globalStyles.infoRow}>
              <InfoField
                label="Pregnancy Status"
                value={data?.pregnancyStatus}
              />
              <InfoField label="Driving Licence" value={data?.drivingLicence} />
            </ViewAtom>

            <FullWidthField
              label="Training Name"
              value={data?.nameOfTrainingProgramme}
            />

            <ViewAtom style={globalStyles.infoRow}>
              <InfoField label="Batch No" value={data?.batchName} />
              <InfoField label="Created By" value={data?.createdBy?.name} />
            </ViewAtom>

            <FullWidthField label="Updated By" value={data?.updatedBy?.name} />
          </ViewAtom>
        </View>

        <ViewAtom style={styles.buttonRow}>
          <FormWhiteButton
            title="Delete"
            onPress={handleDelete}
            containerStyle={styles.button}
          />
          <FormGradientButton
            title="Edit"
            onPress={handleEdit}
            containerStyle={styles.button}
          />
        </ViewAtom>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TraineeRegistrationDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  scrollContainer: {
    paddingBottom: vh(40),
    paddingHorizontal: vw(15),
    paddingTop: vh(15),
  },
  card: {
    backgroundColor: colors.backgroundColor,
    borderRadius: vw(8),
    padding: vw(8),
  },
  cardTitle: {
    fontSize: vw(16),
    fontFamily: fonts.Inter_Bold,
    color: colors.black,
    // textAlign: 'center',
    marginBottom: vw(2),
  },
  cardId: {
    fontSize: vw(12),
    fontFamily: fonts.Inter_Regular,
    color: colors.grey,
    // textAlign: 'center',
    marginBottom: vh(15),
  },
  label: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(12),
    color: colors.grey,
    marginBottom: vh(2),
  },
  value: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    color: '#2D2D2D',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vh(20),
    gap: vw(10),
  },
  button: {
    flex: 1,
    width: 'auto',
    marginBottom: 0,
  },
});
