import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import { useAppSelector } from '../../../../../hooks';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import { downloadAndOpenFile } from '../../../../../utils/CommonFunction';
import { useDownlaodRegistrationFormMutation } from '../../../../../injectEndpointsTrainee/profileEndpoints';
import { usePermission } from '../../../../../hooks/usePermission';
import { canDownloadProfile } from '../../../../../constants/permissionNameTrainee';

interface Props {
  navigation: NavigationType;
}

const ProfileDetails = ({ navigation }: Props) => {
  const { profileData } = useAppSelector(state => state.Profile);
  const { crediantialData } = useAppSelector(state => state.Auth);

  const [downlaodRegistrationFormApi] = useDownlaodRegistrationFormMutation();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.profile_details);
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);

  const getMaritalStatus = (status?: string) => {
    if (status === 'U') return strings.unmarried;
    if (status === 'M') return strings.married;
    return strings.na;
  };

  const fields = [
    { label: strings.trainee_id, value: profileData?.traineeId },
    {
      label: strings.name_of_training_programme,
      value: profileData?.nameOfTrainingProgramme,
    },
    { label: strings.batch_no, value: profileData?.batchName },
    { label: strings.name, value: profileData?.name },
    {
      label: strings.course_duration,
      value:
        profileData?.courseStartDate && profileData?.courseEndDate
          ? `${profileData?.courseStartDate} ${strings.to} ${profileData?.courseEndDate}`
          : strings.na,
    },
    { label: strings.aadhaar_no, value: profileData?.aadhaarNo },
    { label: strings.father_name, value: profileData?.fatherName },
    { label: strings.mother_name, value: profileData?.motherName },
    { label: strings.gpf_pran, value: profileData?.gpfOrPran || strings.na },
    { label: strings.pan_no, value: profileData?.panNo },
    {
      label: strings.marital_status,
      value: getMaritalStatus(profileData?.maritalStatus),
    },
    { label: strings.gender, value: profileData?.gender },
    {
      label: strings.personal_email,
      value: profileData?.otherEmail || strings.na,
    },
    { label: strings.office_email, value: profileData?.officeEmail },
    { label: strings.designation, value: profileData?.designation },
    { label: strings.mobile_no, value: profileData?.mobileNo },
    {
      label: strings.educational_qualification,
      value: profileData?.educationQualification,
    },
    { label: strings.office_address, value: profileData?.officeAddress },
    {
      label: strings.previous_work_experience,
      value: profileData?.previousWorkExperience,
    },
    {
      label: strings.residential_address,
      value: profileData?.residentialAddress,
    },
  ];

  const downloadDetails = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['created_at'],
        sorts: ['desc'],
      },
      filters: [
        ['adminUserId', '=', Number(crediantialData.user[0].adminUserId)],
      ],
      pageNo: 1,
      itemsPerPage: 1,
    };
    downlaodRegistrationFormApi(params)
      .unwrap()
      .then((res: any) => {
        const fileUrl = res?.data?.pdfFileUrl;

        if (fileUrl) {
          downloadAndOpenFile(fileUrl);
        } else {
          Toast.show({
            type: 'error',
            text2: res?.data?.message || strings.something_went_wrong_,
          });
        }
        setLoader(false);
      })
      .catch(err => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message,
        });
      });
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {fields.map((item, index) => (
          <View key={index.toString() + '47878'} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value || strings.na}</Text>
          </View>
        ))}
      </ScrollView>

      {profileData.isSubmitted?.toLowerCase() === 'yes' &&
      profileData.isTraineeIndemnityBondSubmitted?.toLowerCase() === 'yes' &&
      canDownloadProfile() ? (
        <ButtonOrganism
          bttnText={strings.download_and_print}
          onPress={() => {
            navigation.navigate(screensName.AlertOrganism, {
              message: strings.are_you_sure_print,
              okText: strings.ok,
              double: true,
              cancelText: strings.cancel,
              okFunction: () => {
                downloadDetails();
              },
              cancelFunction: () => {},
            });
          }}
        />
      ) : (
        <ButtonOrganism
          bttnText={strings.edit}
          onPress={() => {
            Alert.alert(
              strings.please_note,
              strings.registration_note,
              [
                {
                  text: strings.cancel,
                  style: 'cancel',
                },
                {
                  text: strings.next,
                  onPress: () => navigation.navigate(screensName.EditProfile),
                },
              ],
              { cancelable: true },
            );
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default ProfileDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: vh(20),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: vh(10),
    borderBottomWidth: vw(0.5),
    borderColor: colors.chinese_silver,
    width: vw(330),
  },
  label: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: colors.grey,
    width: vw(160),
  },
  value: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey,
    width: vw(160),
    textAlign: 'right',
  },
});
