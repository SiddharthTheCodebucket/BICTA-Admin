import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useLayoutEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import ImageAtom from '../../../../../components/atoms/ImageAtom';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../constants';
import ViewAtom from '../../../../../components/atoms/ViewAtom';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import ButtonOrganism from '../../../../../components/organisms/ButtonOrganism';
import {
  useDownloadTraineeManageIndemnityBondMutation,
  useUpdateTraineeManageIndemnityBondMutation,
} from '../../../../../injectEndpointsTrainee/profileEndpoints';
import FullscreenLoading from '../../../../../components/organisms/FullscreenLoading';
import { downloadAndOpenFile } from '../../../../../utils/CommonFunction';
import { useAppSelector } from '../../../../../hooks';
import { canDownloadIndemnity } from '../../../../../constants/permissionNameTrainee';

interface Props {
  route: any;
  navigation: NavigationType;
}
const IndemnityBond = (props: Props) => {
  const { navigation } = props;
  let data = props.route.params.data;

  const [updateTraineeManageIndemnityBondApi] =
    useUpdateTraineeManageIndemnityBondMutation();
  const [downloadTraineeManageIndemnityBondApi] =
    useDownloadTraineeManageIndemnityBondMutation();

  const { crediantialData } = useAppSelector(state => state.Auth);
  const { profileData } = useAppSelector(state => state.Profile);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.indemnity_bond_preview);
    navigation.BackButtonPress = () => navigation.goBack();
  }, []);

  const [loader, setLoader] = useState(false);

  const updateTraineeDetails = () => {
    setLoader(true);

    const formData = new FormData();

    formData.append('traineeId', data.traineeId);
    formData.append('relation', data.relation.name);
    formData.append('relationName', data.relationName);
    formData.append('campus', data.campus);
    formData.append('district', data.district);
    formData.append('firstWitnessName', data.firstWitnessName);
    formData.append('firstWitnessDesignation', data.firstWitnessDesignation);
    formData.append('secondWitnessName', data.secondWitnessName);
    formData.append('secondWitnessDesignation', data.secondWitnessDesignation);
    if (data.uploadSignatureOfWitnessFirst) {
      formData.append('signatureOfWitnessFirst', {
        uri: data.uploadSignatureOfWitnessFirst.uri,
        name: data.uploadSignatureOfWitnessFirst.fileName,
        type: data.uploadSignatureOfWitnessFirst.type,
      });
    }

    if (data.uploadSignatureOfWitnessSecond) {
      formData.append('signatureOfWitnessSecond', {
        uri: data.uploadSignatureOfWitnessSecond.uri,
        name: data.uploadSignatureOfWitnessSecond.fileName,
        type: data.uploadSignatureOfWitnessSecond.type,
      });
    }
    updateTraineeManageIndemnityBondApi(formData)
      .unwrap()
      .then((res: any) => {
        navigation.navigate(screensName.AlertOrganism, {
          message: strings.are_you_sure_print,
          okText: strings.ok,
          double: true,
          cancelText: strings.cancel,
          okFunction: () => {
            downloadDetails();
          },
          cancelFunction: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [
                  {
                    name: screensName.MyProfile,
                  },
                ],
              }),
            );
          },
        });

        Toast.show({
          type: 'success',
          text2: res.data.message,
        });
        setLoader(false);
      })
      .catch((err: any) => {
        Toast.show({
          type: 'error',
          text2: err?.data?.message || strings.something_went_wrong_,
        });
        setLoader(false);
      });
  };

  const downloadDetails = () => {
    setLoader(true);
    const params = {
      search: '',
      sort: {
        attributes: ['id'],
        sorts: ['desc'],
      },
      filters: [
        ['adminUserId', '=', Number(crediantialData.user[0].adminUserId)],
      ],
      pageNo: 1,
      itemsPerPage: 1,
    };
    downloadTraineeManageIndemnityBondApi(params)
      .unwrap()
      .then((res: any) => {
        const fileUrl = res?.data?.pdfFileUrl;

        if (fileUrl) {
          // navigation.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [
          //       {
          //         name: screensName.MyProfile,
          //       },
          //     ],
          //   }),
          // );
          // navigation.replace(screensName.MyProfile);

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
      <FullscreenLoading isVisible={loader} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.centerAligned}>
          <ImageAtom source={images.logo} style={styles.logo} />
          <Text style={styles.headingHindi}>
            {strings.hindi_institute_title}
          </Text>

          <Text style={styles.subTextHindi}>{strings.hindi_address}</Text>

          <Text numberOfLines={2} style={styles.headingEnglish}>
            {strings.institute_full_name}
          </Text>

          <Text style={styles.subTextEnglish}>{strings.institute_address}</Text>

          <Text numberOfLines={2} style={styles.title}>
            {strings.indemnity_heading}
          </Text>
        </View>
        <ViewAtom style={styles.seperator} />

        <ViewAtom style={styles.formContainer}>
          <Text style={styles.text}>
            I, <Text style={styles.bold}>{data?.name}</Text>{' '}
            <Text style={styles.bold}>{data?.relation?.name}</Text>{' '}
            <Text style={styles.bold}>{data?.relationName}</Text>{' '}
            <Text style={styles.text}>{strings.residence_of}</Text>{' '}
            <Text style={styles.bold}>{data?.residence}</Text>{' '}
            <Text style={styles.text}>
              {strings.employed_as_posted_at}{' '}
              <Text style={styles.bold}>{data?.employmentAt}</Text>{' '}
            </Text>
            <Text>
              {strings.indemnity_participation_prefix}
              <Text style={styles.bold}> {data?.duration} </Text>{' '}
              {strings.indemnity_program_commencing}{' '}
              {strings.indemnity_day_label}
              <Text style={styles.bold}> {data?.date} </Text>{' '}
              {strings.indemnity_month_label}
              <Text style={styles.bold}> {data?.month} </Text>{' '}
              {strings.indemnity_year_label}
              <Text style={styles.bold}> {data?.year} </Text>
            </Text>
            <Text style={styles.text}>{strings.indemnity_scheduled_at}</Text>
            <Text style={styles.text}>
              <Text style={styles.bold}> {data?.campus} </Text>,{' '}
              {strings.district}
              <Text style={styles.bold}> {data?.district} </Text>
              {strings.indemnity_and_declare}
            </Text>
          </Text>
        </ViewAtom>
        <ViewAtom style={styles.contentPadding}>
          {strings.indemnity_clauses.map((clause: string, index: number) => (
            <Text style={styles.pointText} key={index}>
              {index + 1}. {clause}
            </Text>
          ))}
        </ViewAtom>
        <ViewAtom style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{strings.indemnifier_details}</Text>

          <View style={styles.rowBetween}>
            <View style={styles.flex1}>
              <Text style={styles.text}>{strings.name_of_indemnifier}</Text>
              <Text style={styles.bold}>{data?.name}</Text>
            </View>

            <View style={styles.flex1AlignEnd}>
              <Text style={styles.text}>
                {strings.signature_of_indemnifier}
              </Text>
              {data?.signatureOfIndemnifier ? (
                <Image
                  source={{ uri: data.signatureOfIndemnifier }}
                  style={styles.preview}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.text}>{strings.no_file_uploaded}</Text>
              )}
            </View>
          </View>

          <View style={styles.height30} />
          <Text style={styles.sectionTitle}>
            {strings.witness_details_bipard}
          </Text>

          <View style={styles.marginBottom20}>
            <View style={styles.rowBetween}>
              <View style={styles.flex1}>
                <Text style={styles.text}>{strings.witness_name + ':'}</Text>
                <Text style={styles.bold}>{data.firstWitnessName ?? '--'}</Text>

                <Text style={[styles.text, styles.marginTop4]}>
                  {strings.designation + ':'}
                </Text>
                <Text style={styles.bold}>
                  {data.firstWitnessDesignation ?? '--'}
                </Text>
              </View>

              <View style={styles.flex1AlignEnd}>
                <Text style={styles.text}>{strings.signature_label}</Text>

                {data?.signatureOfWitnessFirst ? (
                  <Image
                    source={{ uri: data.signatureOfWitnessFirst }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                ) : data?.uploadSignatureOfWitnessFirst?.uri ? (
                  <Image
                    source={{ uri: data.uploadSignatureOfWitnessFirst.uri }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.text}>{strings.no_file_uploaded}</Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.marginBottom20}>
            <View style={styles.rowBetween}>
              <View style={styles.flex1}>
                <Text style={styles.text}>{strings.witness_name + ':'}</Text>
                <Text style={styles.bold}>
                  {data.secondWitnessName ?? '--'}
                </Text>

                <Text style={[styles.text, styles.marginTop4]}>
                  {strings.designation + ':'}
                </Text>
                <Text style={styles.bold}>
                  {data.secondWitnessDesignation ?? '--'}
                </Text>
              </View>

              <View style={styles.flex1AlignEnd}>
                <Text style={styles.text}>{strings.signature_label}</Text>
                {data?.signatureOfWitnessSecond ? (
                  <Image
                    source={{ uri: data.signatureOfWitnessSecond }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                ) : data?.uploadSignatureOfWitnessSecond?.uri ? (
                  <Image
                    source={{ uri: data.uploadSignatureOfWitnessSecond.uri }}
                    style={styles.preview}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.text}>{strings.no_file_uploaded}</Text>
                )}
              </View>
            </View>
          </View>
          <Text style={[styles.text, styles.marginTop10]}>
            {strings.date + ': '} {moment().format('DD-MMM-YYYY')}
          </Text>
        </ViewAtom>
      </ScrollView>

      {/* {profileData.isTraineeIndemnityBondSubmitted?.toLowerCase() === 'yes' &&
        canDownloadIndemnity() && (
          <ButtonOrganism
            onPress={() => {
              if (
                profileData.isTraineeIndemnityBondSubmitted?.toLowerCase() ===
                'yes'
              ) {
                downloadDetails();
              } else {
                updateTraineeDetails();
              }
            }}
            bttnText={
              profileData.isTraineeIndemnityBondSubmitted?.toLowerCase() ===
              'yes'
                ? strings.download_and_print
                : strings.submit
            }
          />
        )} */}

      {profileData.isTraineeIndemnityBondSubmitted?.toLowerCase() === 'yes' &&
        canDownloadIndemnity() && (
          <ButtonOrganism
            onPress={() => {
              downloadDetails();
            }}
            bttnText={strings.download_and_print}
          />
        )}
      {profileData.isTraineeIndemnityBondSubmitted?.toLowerCase() === 'no' && (
        <ButtonOrganism
          onPress={() => {
            updateTraineeDetails();
          }}
          bttnText={strings.submit}
        />
      )}
    </SafeAreaView>
  );
};

export default IndemnityBond;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(10),
  },
  logo: {
    width: vw(80),
    height: vw(80),
    resizeMode: 'contain',
  },
  headingHindi: {
    color: colors.black,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
  },
  subTextHindi: {
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
  },
  headingEnglish: {
    color: colors.black,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    textAlign: 'center',
    marginTop: vh(10),
  },
  subTextEnglish: {
    color: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
  },
  title: {
    color: colors.black,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(14),
    textAlign: 'center',
    marginTop: vh(10),
  },
  seperator: {
    height: vh(1),
    backgroundColor: colors.chinese_silver,
    width: '100%',
    marginTop: vh(10),
  },
  centerAligned: {
    alignItems: 'center',
  },
  contentPadding: {
    paddingHorizontal: vw(12),
    marginTop: vh(10),
  },
  sectionContainer: {
    paddingHorizontal: vw(12),
    marginTop: vh(20),
    marginBottom: vh(40),
  },
  flex1: {
    flex: 1,
  },
  flex1AlignEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  height30: {
    height: vh(30),
  },
  marginBottom20: {
    marginBottom: vh(20),
  },
  marginTop4: {
    marginTop: vh(4),
  },
  marginTop10: {
    marginTop: vh(10),
  },
  formContainer: {
    marginTop: vh(10),
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw(15),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: vh(10),
  },
  text: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.black,
    lineHeight: vw(18),
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: colors.black,
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    paddingVertical: 0,
  },
  bold: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(12),
    color: colors.black,
  },
  pointText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.black,
    marginBottom: vh(6),
    lineHeight: vw(18),
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(13),
    color: colors.black,
    marginBottom: vh(10),
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  linkText: {
    color: colors.primary,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    textDecorationLine: 'underline',
  },
  preview: {
    width: vw(150),
    height: vh(80),
    marginTop: vh(5),
    borderRadius: vw(8),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    alignSelf: 'center',
  },
});
