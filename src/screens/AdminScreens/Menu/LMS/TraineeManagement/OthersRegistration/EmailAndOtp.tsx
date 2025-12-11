import { Keyboard, StyleSheet, Text, View } from 'react-native';
import React, { createRef, useEffect, useState } from 'react';
import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ButtonOrganism from '../../../../../../components/organisms/ButtonOrganism';
import DropDownOrganism from '../../../../../../components/organisms/DropDownOrganism';
import { useAppSelector } from '../../../../../../hooks';
import { useDispatch } from 'react-redux';
import {
  saveEmail,
  saveOtp,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';
import TextInputOrganisms from '../../../../../../components/organisms/TextInputOrganisms';
import DateInputOrganism from '../../../../../../components/organisms/DateInputOrganism';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';
import ViewAtom from '../../../../../../components/atoms/ViewAtom';
import ImageUploadOrganism from '../../../../../../components/organisms/ImageUploadOrganism';
import TextAtom from '../../../../../../components/atoms/TextAtom';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import Toast from 'react-native-toast-message';
import { useAddMukhiyaRegistrationMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import moment from 'moment';
import { CommonActions } from '@react-navigation/native';

interface Props {
  route: any;
  navigation: NavigationType;
  goNext: any;
  goBack: any;
}

const EmailAndOtp = (props: Props) => {
  const { navigation, goNext, goBack } = props;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const dispatch = useDispatch();
  const {
    selectedTrainingCenter,
    selectedTrainingName,
    name,
    selectedGender,
    selectedMaritalStatus,
    selectedPregnancyStatus,
    fatherName,
    dob,
    aadharNumber,
    mobileNumber,
    selectedEducationalQualification,
    selectedDepartment,
    selectedDesignation,
    placeOfPosting,
    residentialAddress,
    officeAddress,
    selectedPostingDistrict,
    selectedPostingBlock,
    selectedPostingPanchyat,
    firstWitnessName,
    firstWitnessDesignation,
    firstWitnessSignature,
    secondWitnessName,
    secondWitnessDesignation,
    secondWitnessSignature,
    photo,
    signature,
    aadharCard,

    email,
    otp,
  } = useAppSelector(state => state.otherRegistration);
  const [addMukhiyaRegistrationApi] = useAddMukhiyaRegistrationMutation();

  const [errors, setErrors] = React.useState<any>({});
  const [otpTimer, setOtpTimer] = useState(0);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  const generalSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required'),
    email: Yup.string().required('Email is required'),
  });

  const handleNext = async () => {
    try {
      await generalSchema.validate({
        email,
        otp,
      });
      setErrors({});
      addData();
    } catch (err: any) {
      setErrors({ [err.path]: err.message });
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
  };

  const handleGetOtp = () => {
    if (otpTimer > 0) return;
    sendOtp();
    startOtpTimer();
  };

  const sendOtp = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('officeEmail', email);
    formData.append('aadhaarNo', aadharNumber);
    formData.append('apiFor', 'SEND_OTP');
    addMukhiyaRegistrationApi(formData)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };

  const addData = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('trainingCentre', selectedTrainingCenter.id);
    formData.append('name', name);
    formData.append('dob', moment(dob, 'DD-MM-YYYY').format('YYYY-MM-DD'));
    formData.append('aadhaarNo', aadharNumber);
    formData.append('officeEmail', email);
    formData.append('mobileNo', mobileNumber);
    formData.append('gender', selectedGender.id);
    formData.append('maritalStatus', selectedMaritalStatus.id);
    formData.append('nameOfTrainingProgramme', selectedTrainingName.id);
    formData.append('department', selectedDepartment.id);
    formData.append('selectRole', 22);
    formData.append('relation', selectedGender.id === 'Female' ? 'D/O' : 'S/0');
    formData.append('relationName', fatherName);
    formData.append('designation', selectedDesignation.id);
    formData.append('placeOfPosting', placeOfPosting);
    formData.append(
      'educationQualification',
      selectedEducationalQualification.id,
    );
    formData.append('residentialAddress', residentialAddress);
    formData.append('officeAddress', officeAddress);
    formData.append('postingDistrict', selectedPostingDistrict.id);
    formData.append('postingBlock', selectedPostingBlock.id);
    formData.append('postingPanchayat', selectedPostingPanchyat.id);
    formData.append('campusName', `BIPARD ${selectedTrainingCenter.id}`);
    formData.append('campusDistrict', selectedTrainingCenter.id);
    formData.append('firstWitnessName', firstWitnessName);
    formData.append('firstWitnessDesignation', firstWitnessDesignation);
    formData.append('secondWitnessName', secondWitnessName);
    formData.append('secondWitnessDesignation', secondWitnessDesignation);
    if (selectedGender.id === 'Female') {
      formData.append('pregnancyStatus', selectedPregnancyStatus.id);
    }

    formData.append('traineePhoto', {
      uri: photo.uri,
      name: photo.fileName,
      type: photo.type,
    } as any);
    formData.append('traineeSign', {
      uri: signature.uri,
      name: signature.fileName,
      type: signature.type,
    } as any);
    formData.append('aadhaarPdf', {
      uri: aadharCard.uri,
      name: aadharCard.fileName,
      type: aadharCard.type,
    } as any);
    formData.append('signatureOfWitnessFirst', {
      uri: firstWitnessSignature.uri,
      name: firstWitnessSignature.fileName,
      type: firstWitnessSignature.type,
    } as any);
    formData.append('signatureOfWitnessSecond', {
      uri: secondWitnessSignature.uri,
      name: secondWitnessSignature.fileName,
      type: secondWitnessSignature.type,
    } as any);
    formData.append('otp', otp);

    addMukhiyaRegistrationApi(formData)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                name: screensName.TraineeManagement,
              },
            ],
          }),
        );
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err.data.message,
          autoHide: true,
        });
      });
  };
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <FullscreenLoading isVisible={loader} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <TextInputOrganisms
          label={'Email'}
          placeholder={'Email'}
          ref={input1_ref}
          onSubmitEditing={() => input2_ref.current.focus()}
          value={email}
          onChangeText={(val: any) => {
            dispatch(saveEmail(val));
            setErrors({ ...errors, email: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'next'}
          isMandatory
          errorMessage={errors.email}
        />
        <TextAtom
          style={{
            backgroundColor: otpTimer > 0 ? colors.grey : colors.primary,
            color: colors.white,
            fontFamily: fonts.Roboto_Regular,
            fontSize: vw(12),
            width: vw(110),
            borderRadius: vw(4),
            textAlign: 'center',
            paddingVertical: vh(4),
            marginBottom: vh(2),
            opacity: otpTimer > 0 ? 0.7 : 1,
          }}
          onPress={otpTimer > 0 ? undefined : handleGetOtp}
        >
          {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Get OTP on Email'}
        </TextAtom>
        <TextInputOrganisms
          label={'OTP'}
          placeholder={'OTP'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={otp}
          onChangeText={(val: any) => {
            dispatch(saveOtp(val));
            setErrors({ ...errors, otp: '' });
          }}
          autoCapitalize={'none'}
          returnKeyType={'done'}
          isMandatory
          errorMessage={errors.otp}
          maxLength={4}
          keyboardType="numeric"
        />
      </KeyboardAwareScrollView>
      <ViewAtom style={styles.footer}>
        <ButtonOrganism
          containerStyle={{ width: vw(155) }}
          bttnText="Back"
          onPress={goBack}
        />

        <ButtonOrganism
          containerStyle={{ width: vw(155) }}
          bttnText="Submit"
          onPress={handleNext}
        />
      </ViewAtom>
    </SafeAreaView>
  );
};

export default EmailAndOtp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
  },
  contentScroll: {
    paddingBottom: vh(10),
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
});
