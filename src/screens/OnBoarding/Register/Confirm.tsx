import React, { createRef, useState, useRef } from 'react';
import { Keyboard, Modal, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import { colors, fonts, strings, vh, vw } from '../../../constants';
import { NavigationType } from '../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../components/atoms/TextAtom';
import ViewAtom from '../../../components/atoms/ViewAtom';
import TextInputOrganisms from '../../../components/organisms/TextInputOrganisms';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import { useAppSelector } from '../../../hooks';
import {
  emailRegex,
  mobileRegex,
  normalizeNumber,
} from '../../../utils/CommonFunction';

import { useAddTraineeRegistrationMutation } from '../../../injectEndpointsTrainee/onboardingEndpoints';
import moment from 'moment';
import Router from '../../../navigator/routes';
import { resetRegistrationState } from '../../../featuresTrainee/Registration/registrationSlice';

interface Props {
  navigation: NavigationType;

  goBack: any;
}

const Confirm = (props: Props) => {
  const { goBack, navigation } = props;
  const dispatch = useDispatch();

  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [addTraineeRegistrationApi] = useAddTraineeRegistrationMutation();

  const {
    isAlreadyRegistered,
    trainingCenter,
    name,
    dob,
    selectedGender,
    placeOfPosting,
    aadharNumber,
    selectedBloodGroup,
    selecteddepartment,
    mobileNumber,
    officeEmail,
    qrData,
    uploadedPhoto,
    uploadedSignature,
    selectedMaritalStatus,
    pregnancyStatus,
  } = useAppSelector(state => state.Registration);

  const [localMobile, setLocalMobile] = useState(mobileNumber);
  const [localEmail, setLocalEmail] = useState(officeEmail);

  const [loader, setLoader] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const otpModalRef = useRef(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs: any = [createRef(), createRef(), createRef(), createRef()];

  const handleOtpChange = (value: string, index: number) => {
    const cleaned = value.replace(/[^\D]/g, '');
    const temp = [...otp];
    temp[index] = cleaned;
    setOtp(temp);

    if (cleaned && index < 3) otpRefs[index + 1].current?.focus();
  };

  const schema = Yup.object().shape({
    officeEmail: Yup.string()
      .required('Office Email is required')
      .matches(emailRegex, 'Enter valid office email id'),
    mobileNumber:
      isAlreadyRegistered.id === 'Yes'
        ? Yup.string().notRequired()
        : Yup.string()
            .required(strings.mobile_required)
            .max(10, strings.enter_valid_mobile)
            .min(10, strings.enter_valid_mobile)
            .matches(mobileRegex, strings.enter_valid_mobile),
  });

  const handleNext = () => {
    const form = {
      mobileNumber: localMobile,
      officeEmail: localEmail,
    };

    try {
      schema.validateSync(form, { abortEarly: true });
      setErrors({});
      sendOtp();
    } catch (err: any) {
      const path = err?.path;
      const message = err?.message;
      if (path && message) {
        setErrors((prev: any) => ({
          ...prev,
          [path]: message,
        }));
      }
    }
  };

  const closeModal = () => {
    otpModalRef.current = false;
    setShowOtpModal(false);

    setTimeout(() => {
      setOtp(['', '', '', '']);
    }, 100);
  };

  const sendOtp = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append(
      'isAlreadyRegistered',
      String(isAlreadyRegistered.id === 'Yes'),
    );

    formData.append('nameOfTrainingProgramme', qrData.trainingId);
    if (isAlreadyRegistered.id === 'No') {
      formData.append('name', name);
      formData.append('aadhaarNo', aadharNumber);
    }
    formData.append('officeEmail', localEmail);
    formData.append('apiFor', 'SEND_OTP');

    addTraineeRegistrationApi(formData)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        setShowOtpModal(true);
        setOtp(['', '', '', '']);
        setTimeout(() => {
          otpRefs[0]?.current?.focus();
        }, 200);
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

  const addTraineeRegistration = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('trainingCentre', trainingCenter.name);
    formData.append('nameOfTrainingProgramme', qrData.trainingId);
    formData.append('name', name);
    formData.append('dob', moment(dob, 'DD-MM-YYYY').format('YYYY-MM-DD'));
    formData.append('aadhaarNo', aadharNumber);
    formData.append('officeEmail', localEmail);
    formData.append('mobileNo', localMobile);
    formData.append('gender', selectedGender.id);
    formData.append('maritalStatus', selectedMaritalStatus.id);
    formData.append('department', selecteddepartment.id);
    formData.append('selectRole', 22);
    formData.append('bloodGroup', selectedBloodGroup.id);
    formData.append('otp', otp?.join(''));
    formData.append('designation', selecteddepartment.id);
    formData.append('placeOfPosting', placeOfPosting);

    if (selectedGender.id === 'Female' && selectedMaritalStatus.id === 'M') {
      formData.append('pregnancyStatus', pregnancyStatus.id);
    }

    formData.append('photo', {
      uri: uploadedPhoto.uri,
      name: uploadedPhoto.fileName,
      type: uploadedPhoto.type,
    });

    formData.append('sign', {
      uri: uploadedSignature.uri,
      name: uploadedSignature.fileName,
      type: uploadedSignature.type,
    });

    addTraineeRegistrationApi(formData)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        setShowOtpModal(false);
        dispatch(resetRegistrationState());
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
        Router.resetNew(navigation, 'OnBoardingNavigator');
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

  const addTraineeRegistrationForAlreadyRegister = () => {
    setLoader(true);
    const formData = new FormData();
    formData.append('isAlreadyRegistered', true);
    formData.append('trainingCentre', trainingCenter.name);
    formData.append('nameOfTrainingProgramme', qrData.trainingId);
    formData.append('officeEmail', officeEmail);
    formData.append('mobileNo', mobileNumber);
    formData.append('gender', selectedGender.id);
    formData.append('designation', selecteddepartment.id);
    formData.append('placeOfPosting', placeOfPosting);
    formData.append('maritalStatus', selectedMaritalStatus.id);
    formData.append('otp', otp);
    if (selectedGender.id === 'Female' && selectedMaritalStatus.id === 'M') {
      formData.append('pregnancyStatus', pregnancyStatus.id);
    }

    addTraineeRegistrationApi(formData)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        setShowOtpModal(false);
        Toast.show({
          type: 'success',
          text2: res.data.message,
          autoHide: true,
        });
        dispatch(resetRegistrationState());
        Router.resetNew(navigation, 'OnBoardingNavigator');
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <FullscreenLoading isVisible={loader} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        {isAlreadyRegistered.id !== 'Yes' && (
          <TextInputOrganisms
            label={strings.mobile_no}
            placeholder={strings.mobile_no}
            ref={input1_ref}
            onSubmitEditing={() => input2_ref.current.focus()}
            value={localMobile}
            returnKeyType={'next'}
            onChangeText={(val: string) => {
              let formatted = normalizeNumber(val);
              setLocalMobile(formatted);
              setErrors({ ...errors, mobileNumber: '' });
            }}
            isMandatory
            errorMessage={errors.mobileNumber}
            maxLength={10}
            keyboardType="numeric"
          />
        )}

        <TextInputOrganisms
          label={'Office Email'}
          placeholder={'Office Email'}
          ref={input2_ref}
          onSubmitEditing={() => Keyboard.dismiss()}
          value={localEmail}
          returnKeyType={'next'}
          onChangeText={(val: string) => {
            setLocalEmail(val);
            setErrors({ ...errors, officeEmail: '' });
          }}
          isMandatory
          errorMessage={errors.officeEmail}
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
          bttnText="Send OTP"
          onPress={handleNext}
        />
      </ViewAtom>

      <Modal visible={showOtpModal} transparent animationType="fade">
        <ViewAtom
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: vw(20),
          }}
        >
          <ViewAtom
            style={{
              width: '100%',
              backgroundColor: colors.white,
              borderRadius: 20,
              padding: vw(20),
            }}
          >
            <TextAtom
              style={{
                fontFamily: fonts.Roboto_Bold,
                fontSize: vw(18),
                textAlign: 'center',
                color: '#7A321B',
                marginBottom: vh(10),
              }}
            >
              OTP Verification
            </TextAtom>

            <ViewAtom
              style={{
                height: 1,
                backgroundColor: '#ddd',
                marginBottom: vh(15),
              }}
            />

            <TextAtom
              style={{
                fontSize: vw(13),
                marginBottom: vh(10),
                fontFamily: fonts.Roboto_Medium,
              }}
            >
              Enter OTP
            </TextAtom>

            <ViewAtom
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: vh(20),
              }}
            >
              {otp.map((digit, index) => (
                <TextInput
                  key={`otp-${index.toString()}`}
                  ref={otpRefs[index]}
                  value={digit}
                  onChangeText={val => handleOtpChange(val, index)}
                  maxLength={1}
                  keyboardType="numeric"
                  style={{
                    width: vw(55),
                    height: vh(55),
                    textAlign: 'center',
                    fontSize: vw(22),
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 10,
                    backgroundColor: '#fff',
                    color: colors.black,
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      if (otp[index] === '' && index > 0) {
                        otpRefs[index - 1].current?.focus();
                      } else {
                        const temp = [...otp];
                        temp[index] = '';
                        setOtp(temp);
                      }
                    }
                  }}
                />
              ))}
            </ViewAtom>

            <ViewAtom
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: vh(10),
              }}
            >
              <ButtonOrganism
                bttnText="Cancel"
                onPress={closeModal}
                containerStyle={{
                  width: '48%',
                  backgroundColor: '#f7c7c7',
                  borderColor: '#a63636',
                  borderWidth: 1,
                }}
                bttnTextStyle={{
                  color: '#a63636',
                  fontFamily: fonts.Roboto_Bold,
                }}
              />

              <ButtonOrganism
                bttnText="Submit"
                onPress={() => {
                  closeModal();

                  const code = otp.join('');

                  if (code.length === 4) {
                    if (isAlreadyRegistered.id === 'No') {
                      addTraineeRegistration();
                    } else {
                      addTraineeRegistrationForAlreadyRegister();
                    }
                    return;
                  }

                  Toast.show({
                    type: 'error',
                    text1: 'Invalid OTP',
                    text2: 'Please enter a valid 4-digit OTP.',
                  });
                }}
                containerStyle={{
                  width: '48%',
                  backgroundColor: '#d1f7d5',
                  borderColor: '#2d8a39',
                  borderWidth: 1,
                }}
                bttnTextStyle={{
                  color: '#2d8a39',
                  fontFamily: fonts.Roboto_Bold,
                }}
              />
            </ViewAtom>

            <TextAtom
              numberOfLines={0}
              style={{
                fontSize: vw(11),
                color: colors.black,
                fontFamily: fonts.Roboto_Bold,
              }}
            >
              <TextAtom
                style={{
                  color: 'red',
                  fontFamily: fonts.Roboto_Bold,
                  fontSize: vw(11),
                }}
              >
                NOTE:
              </TextAtom>{' '}
              Check your email {localEmail} for OTP.
            </TextAtom>
          </ViewAtom>
        </ViewAtom>
      </Modal>
    </SafeAreaView>
  );
};

export default Confirm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    alignItems: 'center',
  },
  contentContainer: {
    paddingBottom: vh(20),
  },
  scrollView: {
    flex: 1,
  },
  footer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
});
