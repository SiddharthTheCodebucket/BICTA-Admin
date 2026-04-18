import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import moment from 'moment';

import { NavigationType } from '../../../../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import { colors, fonts, vh, vw } from '../../../../../../constants';
import { useAppSelector } from '../../../../../../hooks';
import { normalizeNumber } from '../../../../../../utils/CommonFunction';
import { useAddMukhiyaRegistrationMutation } from '../../../../../../injectEndpoints/lmsEndpoints';
import {
  resetOtherRegistrationState,
  saveEmail,
  saveOtp,
} from '../../../../../../features/OtherRegistration/otherRegistrationSlice';

import {
  FormFieldWrapper,
  FormGradientButton,
  FormTextInputWithTitle,
  FormWhiteButton,
} from '../../../../../../components/templates';
import AdminBottomModal from '../../../../../../components/organisms/AdminBottomModal';
import TextAtom from '../../../../../../components/atoms/TextAtom';

interface Props {
  navigation: NavigationType;
  goBack: any;
  onDone?: any;
}

type OtpLocalFormType = {
  email: string;
  otp: string;
};

const EmailAndOtp = (props: Props) => {
  const { navigation, goBack, onDone } = props;

  const dispatch = useDispatch();
  const otpInputRef = useRef<TextInput>(null);
  const input1_ref = useRef<any>(null);

  const [addMukhiyaRegistrationApi] = useAddMukhiyaRegistrationMutation();

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

  const [errors, setErrors] = useState<any>({});
  const [otpTimer, setOtpTimer] = useState(0);
  const [loader, setLoader] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);

  const [localForm, setLocalForm] = useState<OtpLocalFormType>({
    email: email || '',
    otp: otp || '',
  });

  const emailSchema = Yup.object().shape({
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required'),
  });

  const otpSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required'),
  });

  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    if (otpModalVisible) {
      setTimeout(() => {
        otpInputRef.current?.focus?.();
      }, 250);
    }
  }, [otpModalVisible]);

  const setValue = (key: keyof OtpLocalFormType, value: any) => {
    setLocalForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const clearError = (key: string) => {
    setErrors((prev: any) => ({ ...prev, [key]: '' }));
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
  };

  const formatTimer = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const maskEmail = (value: string) => {
    if (!value || !value.includes('@')) return value || '';
    const [user, domain] = value.split('@');
    if (!user) return `***@${domain}`;
    if (user.length <= 2) return `${user[0] ?? ''}***@${domain}`;
    return `${user[0]}***${user[user.length - 1]}@${domain}`;
  };

  const sendOtp = async () => {
    setOtpModalVisible(true);
    return;

    setLoader(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('officeEmail', localForm.email);
    formData.append('aadhaarNo', aadharNumber);
    formData.append('apiFor', 'SEND_OTP');

    try {
      const res: any = await addMukhiyaRegistrationApi(formData).unwrap();
      Toast.show({
        type: 'success',
        text2: res?.data?.message || 'OTP sent successfully',
        autoHide: true,
      });
      setLoader(false);
      return true;
    } catch (err: any) {
      setLoader(false);
      Toast.show({
        type: 'error',
        text2: err?.data?.message || 'Something went wrong',
        autoHide: true,
      });
      return false;
    }
  };

  const handleGetOtp = async () => {
    if (otpTimer > 0) return;

    try {
      await emailSchema.validate(
        { email: localForm.email },
        { abortEarly: true },
      );
      clearError('email');

      const sent = await sendOtp();
      if (sent) {
        setOtpModalVisible(true);
        startOtpTimer();
      }
    } catch (err: any) {
      setErrors({ email: err.message });
    }
  };

  const addData = async () => {
    setLoader(true);

    const formData = new FormData();
    formData.append('trainingCentre', selectedTrainingCenter.id);
    formData.append('name', name);
    formData.append('dob', moment(dob, 'DD-MM-YYYY').format('YYYY-MM-DD'));
    formData.append('aadhaarNo', aadharNumber);
    formData.append('officeEmail', localForm.email);
    formData.append('mobileNo', mobileNumber);
    formData.append('gender', selectedGender.id);
    formData.append('maritalStatus', selectedMaritalStatus.id);
    formData.append('nameOfTrainingProgramme', selectedTrainingName.id);
    formData.append('department', selectedDepartment.id);
    formData.append('selectRole', 22);
    formData.append('relation', selectedGender.id === 'Female' ? 'D/O' : 'S/O');
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

    formData.append('otp', localForm.otp);

    try {
      const res: any = await addMukhiyaRegistrationApi(formData).unwrap();
      setLoader(false);
      Toast.show({
        type: 'success',
        text2: res?.data?.message || 'Submitted successfully',
        autoHide: true,
      });
      onDone?.();
      navigation.pop();
      dispatch(resetOtherRegistrationState());
    } catch (err: any) {
      setLoader(false);
      Toast.show({
        type: 'error',
        text2: err?.data?.message || 'Something went wrong',
        autoHide: true,
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await otpSchema.validate({ otp: localForm.otp }, { abortEarly: true });
      clearError('otp');
      setOtpModalVisible(false);
      await addData();
    } catch (err: any) {
      setErrors({ otp: err.message });
    }
  };

  const handleBack = () => {
    dispatch(saveEmail(localForm.email));
    dispatch(saveOtp(localForm.otp));
    goBack();
  };

  const otpDigits = localForm.otp.split('');

  const renderOtpBox = (index: number) => (
    <View key={index} style={styles.otpBox}>
      <TextAtom style={styles.otpBoxText}>{otpDigits[index] ?? ''}</TextAtom>
    </View>
  );

  return (
    <View style={styles.container}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <FormFieldWrapper>
          <FormTextInputWithTitle
            ref={input1_ref}
            title="Email"
            placeholder="Email"
            isMandatory
            value={localForm.email}
            onChangeText={(val: any) => {
              setValue('email', val);
              clearError('email');
            }}
            onSubmitEditing={handleGetOtp}
            returnKeyType="done"
            autoCapitalize="none"
            errorMessage={errors.email}
          />

          <FormGradientButton
            title={
              otpTimer > 0
                ? `Resend in ${formatTimer(otpTimer)} sec`
                : 'Get OTP on Email'
            }
            onPress={handleGetOtp}
            disabled={otpTimer > 0}
            containerStyle={styles.getOtpButton}
          />
        </FormFieldWrapper>
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <FormWhiteButton
          title="Back"
          onPress={handleBack}
          containerStyle={styles.buttonContainer}
        />
        <FormGradientButton
          title="Continue"
          onPress={() => {
            if (otpTimer > 0) {
              setOtpModalVisible(true);
            } else {
              handleGetOtp();
            }
          }}
          containerStyle={styles.buttonContainer}
        />
      </View>

      <AdminBottomModal
        visible={otpModalVisible}
        onClose={() => setOtpModalVisible(false)}
        title="OTP Verification"
        sheetStyle={styles.modalSheet}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalCard}>
          <TextAtom style={styles.modalHeading}>Enter OTP</TextAtom>
          <TextAtom style={styles.modalSubText}>
            Enter the security code sent on {maskEmail(localForm.email)}
          </TextAtom>

          <Pressable
            style={styles.otpRow}
            onPress={() => otpInputRef.current?.focus?.()}
          >
            {Array.from({ length: 4 }).map((_, index) => renderOtpBox(index))}

            <TextInput
              ref={otpInputRef}
              value={localForm.otp}
              onChangeText={(text: string) => {
                const numeric = normalizeNumber(text).slice(0, 4);
                setValue('otp', numeric);
                clearError('otp');
              }}
              keyboardType="number-pad"
              maxLength={4}
              autoFocus={false}
              style={styles.hiddenInput}
              caretHidden
            />
          </Pressable>

          {!!errors.otp && (
            <TextAtom style={styles.otpError}>{errors.otp}</TextAtom>
          )}

          <View style={styles.resendRow}>
            <TextAtom style={styles.didntGetText}>Didn't get the OTP?</TextAtom>

            {otpTimer > 0 ? (
              <TextAtom style={styles.timerText}>
                Resend OTP in{' '}
                <TextAtom style={styles.timerHighlight}>
                  {formatTimer(otpTimer)} sec
                </TextAtom>
              </TextAtom>
            ) : (
              <TextAtom style={styles.resendText} onPress={handleGetOtp}>
                Resend OTP
              </TextAtom>
            )}
          </View>
        </View>

        <View style={styles.modalButtonsRow}>
          <FormWhiteButton
            title="Cancel"
            onPress={() => setOtpModalVisible(false)}
            containerStyle={styles.modalButtonContainer}
          />
          <FormGradientButton
            title="Verify"
            onPress={handleVerifyOtp}
            containerStyle={styles.modalButtonContainer}
          />
        </View>
      </AdminBottomModal>
    </View>
  );
};

export default EmailAndOtp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
    paddingTop: vw(20),
    width: '100%',
  },
  contentScroll: {
    paddingHorizontal: vw(16),
    paddingBottom: vh(16),
    width: '100%',
  },
  getOtpButton: {
    alignSelf: 'flex-start',
    width: vw(190),
    marginTop: vh(2),
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: vw(12),
    paddingHorizontal: vw(16),
    paddingBottom: vh(20),
  },
  buttonContainer: {
    flex: 1,
  },
  modalSheet: {
    borderTopLeftRadius: vw(24),
    borderTopRightRadius: vw(24),
    paddingHorizontal: vw(16),
    paddingTop: vh(10),
    paddingBottom: vh(18),
    maxHeight: '88%',
  },
  modalContent: {
    paddingBottom: vh(8),
  },
  modalCard: {
    backgroundColor: colors.backgroundColor,
    borderRadius: vw(14),
    paddingHorizontal: vw(12),
    paddingVertical: vh(12),
  },
  modalHeading: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(17),
    color: colors.text_black,
    marginBottom: vh(6),
  },
  modalSubText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
    marginBottom: vh(16),
    lineHeight: vw(18),
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: vw(10),
    alignItems: 'center',
    marginBottom: vh(10),
  },
  otpBox: {
    width: vw(36),
    height: vw(40),
    borderRadius: vw(7),
    borderWidth: 1,
    borderColor: colors.borderColor || '#BFC7D5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  otpBoxText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(15),
    color: colors.text_black,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpError: {
    color: colors.red || '#D92D20',
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(11),
    marginBottom: vh(10),
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: vw(10),
    marginTop: vh(2),
  },
  didntGetText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
  },
  resendText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.primary,
  },
  timerText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
    textAlign: 'right',
  },
  timerHighlight: {
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
    fontSize: vw(12),
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: vw(10),
    marginTop: vh(16),
  },
  modalButtonContainer: {
    flex: 1,
  },
});
