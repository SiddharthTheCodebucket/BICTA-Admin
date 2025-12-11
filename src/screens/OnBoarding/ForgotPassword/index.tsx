import React, { createRef, useLayoutEffect, useState } from 'react';
import { ImageBackground, Keyboard, StyleSheet } from 'react-native';
import * as Yup from 'yup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../constants';
import ImageAtom from '../../../components/atoms/ImageAtom';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../components/atoms/TextAtom';
import TextInputOrganisms from '../../../components/organisms/TextInputOrganisms';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import {
  useForgotPasswordOtpMutation,
  useForgotPasswordOtpVerifyMutation,
  useForgotPasswordSetNewPassMutation,
} from '../../../injectEndpoints/onboardingEndpoints';
import ViewAtom from '../../../components/atoms/ViewAtom';
import DropDownOrganism from '../../../components/organisms/DropDownOrganism';

interface Props {
  navigation: NavigationType;
}

const errorInitialData = {
  'role.id': '',
  username: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

const ForgotPassword = (props: Props) => {
  const { navigation } = props;
  const input1_ref: any = createRef();
  const input2_ref: any = createRef();
  const input3_ref: any = createRef();
  const input4_ref: any = createRef();

  useLayoutEffect(() => {
    Header.setNavigation(navigation, strings.forgot_password_title);
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  });

  const [role, setRole] = useState<any>({});
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [showPassField, setShowPassField] = useState(false);
  const [error, setError] = useState(errorInitialData);
  const [loader, setLoader] = useState(false);

  const [forgotPasswordOtpApi] = useForgotPasswordOtpMutation();
  const [forgotPasswordOtpVerifyApi] = useForgotPasswordOtpVerifyMutation();
  const [forgotPasswordSetNewApi] = useForgotPasswordSetNewPassMutation();

  const usernameSchema = Yup.object().shape({
    username: Yup.string().required(strings.username_required),
    role: Yup.object({
      id: Yup.string().required(strings.role_required),
    }),
  });

  const otpSchema = Yup.object().shape({
    username: Yup.string().required(strings.username_required),
    otp: Yup.string().required(strings.otp_required),
  });

  const passwordSchema = Yup.object().shape({
    confirmPassword: Yup.string()
      .nullable()
      .equals([newPassword], strings.password_mismatch)
      .required(strings.confirm_password_required),
    newPassword: Yup.string()
      .nullable()
      .required(strings.new_password_required),
    username: Yup.string().required(strings.username_required),
  });

  const handleSubmit = () => {
    try {
      if (!showOtpField && !showPassField) {
        usernameSchema.validateSync({ username, role });

        sendOtp();
      } else if (showOtpField && !showPassField) {
        otpSchema.validateSync({ username, otp });
        otpVerify();
      } else {
        passwordSchema.validateSync({ username, newPassword, confirmPassword });
        setPassword();
      }
    } catch (err: any) {
      setError({ ...error, [err.path]: err.message });
    }
  };

  const sendOtp = () => {
    setLoader(true);
    const params = {
      userName: username,
      apiFor: 'SEND_OTP',
      loginType: role.id,
    };
    forgotPasswordOtpApi(params)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        setShowOtpField(true);
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

  const otpVerify = () => {
    setLoader(true);
    const params = {
      userName: username,
      apiFor: 'VERIFY_OTP',
      otp: Number(otp),
      loginType: role.id,
    };
    forgotPasswordOtpVerifyApi(params)
      .unwrap()
      .then((res: any) => {
        setLoader(false);
        setShowOtpField(false);
        setShowPassField(true);
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

  const setPassword = () => {
    setLoader(true);
    const params = {
      userName: username,
      apiFor: 'RESET_PASSWORD',
      newPassword: newPassword,
      confirmNewPassword: confirmPassword,
      loginType: role.id,
    };
    forgotPasswordSetNewApi(params)
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
                name: screensName.Login,
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
        style={styles.scrollView}
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <ImageBackground
          source={images.bipard_background}
          style={styles.headerBg}
        >
          <ImageAtom source={images.logo} style={styles.logoStyle} />
          <TextAtom numberOfLines={2} style={styles.headerTitle}>
            {strings.bipard}
          </TextAtom>
        </ImageBackground>
        <ViewAtom style={styles.formWrapper}>
          <TextAtom style={styles.welcomeText}>
            {strings.welcome_to_bipard_erp}
          </TextAtom>
          <TextAtom style={styles.signInText}>
            {strings.forgot_password_title}
          </TextAtom>
          <DropDownOrganism
            label="Role"
            placeholder="Role"
            onPress={() => {
              navigation.navigate('DropDownModal', {
                name: 'Role',
                Data: [
                  { id: 'TRAINEE', name: 'Trainee' },
                  { id: 'NON-TRAINEE', name: 'BIPARD Officials' },
                ],
                selectedData: role,
                setSelectedData: (data: any) => {
                  setRole(data);
                  setError({ ...error, 'role.id': '' });
                },
                typeName: 'name',
                typeId: 'id',
              });
            }}
            inputText={role?.name}
            isMandatory
            errorMessage={error['role.id']}
          />
          <TextInputOrganisms
            label={strings.username}
            placeholder={strings.username}
            ref={input1_ref}
            onSubmitEditing={() => showOtpField && input2_ref.current.focus()}
            value={username}
            autoCapitalize="none"
            returnKeyType="done"
            onChangeText={(val: string) => {
              setError({ ...error, username: '' });
              setUsername(val);
            }}
            errorMessage={error.username}
            isMandatory
          />

          {showOtpField && !showPassField && (
            <TextInputOrganisms
              label={strings.otp}
              placeholder={strings.otp}
              ref={input2_ref}
              onSubmitEditing={() => Keyboard.dismiss()}
              value={otp}
              autoCapitalize="none"
              returnKeyType="done"
              onChangeText={(val: string) => {
                setError({ ...error, otp: '' });
                setOtp(val);
              }}
              errorMessage={error.otp}
              keyboardType="numeric"
              maxLength={4}
              isMandatory
            />
          )}

          {showPassField && (
            <>
              <TextInputOrganisms
                label={strings.new_password}
                placeholder={strings.new_password}
                ref={input3_ref}
                onSubmitEditing={() => input4_ref.current.focus()}
                value={newPassword}
                autoCapitalize="none"
                returnKeyType="next"
                onChangeText={(val: string) => {
                  setError({ ...error, newPassword: '' });
                  setNewPassword(val);
                }}
                errorMessage={error.newPassword}
                secureTextEntry
                isMandatory
              />

              <TextInputOrganisms
                label={strings.confirm_password}
                placeholder={strings.confirm_password}
                ref={input4_ref}
                onSubmitEditing={() => Keyboard.dismiss()}
                value={confirmPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onChangeText={(val: string) => {
                  setError({ ...error, confirmPassword: '' });
                  setConfirmPassword(val);
                }}
                errorMessage={error.confirmPassword}
                secureTextEntry
                isMandatory
              />
            </>
          )}
        </ViewAtom>
        <ButtonOrganism onPress={handleSubmit} bttnText={strings.submit} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  headerBg: {
    width: '100%',
    height: vh(250),
  },
  logoStyle: {
    width: vw(131),
    height: vw(63),
    resizeMode: 'contain',
    marginTop: vh(10),
    alignSelf: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
    marginTop: vh(10),
    width: vw(330),
    alignSelf: 'center',
  },
  contentScroll: {
    paddingBottom: vh(10),
  },
  welcomeText: {
    color: colors.grey,
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(14),
  },
  signInText: {
    color: colors.black,
    fontFamily: fonts.Roboto_Bold,
    fontSize: vw(16),
    marginTop: vh(10),
    marginBottom: vh(10),
  },
  scrollContent: {
    paddingHorizontal: vw(15),
    flex: 1,
    marginTop: vh(20),
  },
  scrollView: {
    flex: 1,
  },
  formWrapper: {
    flex: 1,
    marginTop: vh(20),
    paddingHorizontal: vh(15),
  },
});
