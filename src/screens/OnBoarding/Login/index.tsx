import React, { createRef, useEffect, useState } from 'react';
import {
  ImageBackground,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageAtom from '../../../components/atoms/ImageAtom';
import {
  colors,
  fonts,
  images,
  screensName,
  strings,
  vh,
  vw,
} from '../../../constants';
import ButtonOrganism from '../../../components/organisms/ButtonOrganism';
import { NavigationType } from '../../../components/organisms/HeaderOrganism';
import FullscreenLoading from '../../../components/organisms/FullscreenLoading';
import TextAtom from '../../../components/atoms/TextAtom';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TextInputOrganisms from '../../../components/organisms/TextInputOrganisms';
import ViewAtom from '../../../components/atoms/ViewAtom';
import { useUserLoginMutation } from '../../../injectEndpoints/onboardingEndpoints';
import { saveCrediantial, saveToken } from '../../../features/Auth/authSlice';
import Router from '../../../navigator/routes';
import DropDownOrganism from '../../../components/organisms/DropDownOrganism';

const errorInitialData = {
  username: '',
  password: '',
  'role.id': '',
};

interface Props {
  navigation: NavigationType;
}

const Login = (props: Props) => {
  const { navigation } = props;
  const dispatch = useDispatch();

  const input1_ref: any = createRef();
  const input2_ref: any = createRef();

  const [userLoginApi] = useUserLoginMutation();

  const [role, setRole] = useState<any>({});
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(errorInitialData);
  const [isRemembered, setIsRemembered] = useState(false);
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const storedUserRole = await AsyncStorage.getItem('rememberedUserRole');
        const storedUsername = await AsyncStorage.getItem('rememberedUsername');
        const storedPassword = await AsyncStorage.getItem('rememberedPassword');

        const parsedRole = storedUserRole ? JSON.parse(storedUserRole) : {};

        if (parsedRole || (storedUsername && storedPassword)) {
          if (parsedRole) setRole(parsedRole);
          if (storedUsername) setUsername(storedUsername);
          if (storedPassword) setPassword(storedPassword);
          setIsRemembered(true);
        }
      } catch (e) {}
    };
    loadRememberedCredentials();
  }, []);

  const isValidate = () => {
    try {
      const accountInfoSchema = Yup.object().shape({
        password: Yup.string().required(strings.password_required),
        username: Yup.string().required(strings.username_required),
        role: Yup.object({
          id: Yup.string().required(strings.role_required),
        }),
      });
      accountInfoSchema.validateSync({
        role: role,
        username: username,
        password: password,
      });
      return true;
    } catch (err: any) {
      setError({ ...error, [err.path]: err.message });
      return false;
    }
  };

  const handleCodeBucketLink = () => {
    Linking.openURL('https://www.codebucketsolutions.com/');
  };

  const login = () => {
    setLoader(true);
    const params = { login: username, password, loginType: role.id };
    userLoginApi(params)
      .unwrap()
      .then(async (res: any) => {
        setLoader(false);
        dispatch(saveCrediantial(res.data));
        dispatch(saveToken(res.data.token));
        try {
          if (isRemembered) {
            await AsyncStorage.setItem('rememberedUsername', username);
            await AsyncStorage.setItem('rememberedPassword', password);
            await AsyncStorage.setItem(
              'rememberedUserRole',
              JSON.stringify(role),
            );
          } else {
            await AsyncStorage.removeItem('rememberedUsername');
            await AsyncStorage.removeItem('rememberedPassword');
            await AsyncStorage.removeItem('rememberedUserRole');
          }
        } catch (e) {}
        if (res.data.user[0].userType?.toUpperCase() === 'TRAINEE') {
          Router.resetNew(navigation, 'TraineeRootNavigator');
        } else {
          Router.resetNew(navigation, 'RootNavigatorAdmin');
        }
      })
      .catch((err: any) => {
        setLoader(false);
        Toast.show({
          type: 'error',
          text2: err?.data?.message || 'Login failed',
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
        contentContainerStyle={styles.contentScroll}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh(80)}
      >
        <ImageBackground
          source={images.bipard_background}
          style={styles.headerBg}
          resizeMode="stretch"
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
          <TextAtom style={styles.signInText}>{strings.sign_in}</TextAtom>
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
            onSubmitEditing={() => input2_ref.current.focus()}
            value={username}
            autoCapitalize="none"
            returnKeyType="next"
            onChangeText={(val: string) => {
              setError({ ...error, username: '' });
              setUsername(val);
            }}
            errorMessage={error.username}
            isMandatory
          />

          <TextInputOrganisms
            label={strings.password}
            placeholder={strings.password}
            ref={input2_ref}
            onSubmitEditing={() => Keyboard.dismiss()}
            value={password}
            autoCapitalize="none"
            returnKeyType="done"
            onChangeText={(val: string) => {
              setError({ ...error, password: '' });
              setPassword(val);
            }}
            errorMessage={error.password}
            secureTextEntry
            isMandatory
          />
          <ViewAtom style={styles.rememberForgotWrapper}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              activeOpacity={0.8}
              onPress={async () => {
                const newState = !isRemembered;
                setIsRemembered(newState);
                if (newState && role && username && password) {
                  await AsyncStorage.setItem(
                    'rememberedUserRole',
                    JSON.stringify(role),
                  );
                  await AsyncStorage.setItem('rememberedUsername', username);
                  await AsyncStorage.setItem('rememberedPassword', password);
                } else {
                  await AsyncStorage.removeItem('rememberedUserRole');
                  await AsyncStorage.removeItem('rememberedUsername');
                  await AsyncStorage.removeItem('rememberedPassword');
                }
              }}
            >
              <ImageAtom
                source={isRemembered ? images.checkbox : images.uncheckbox}
                style={styles.checkboximg}
              />
              <Text style={styles.rememberText}>{strings.remember_me}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate(screensName.ForgotPassword)}
            >
              <TextAtom style={styles.forgotText}>
                {strings.forgot_password}
              </TextAtom>
            </TouchableOpacity>
          </ViewAtom>

          <ButtonOrganism
            onPress={() => {
              if (isValidate()) {
                login();
              }
            }}
            bttnText={strings.sign_in_button}
          />
          <ButtonOrganism
            onPress={() => {
              navigation.navigate(screensName.QRCodeScan);
            }}
            bttnText={strings.register_button}
            bttnTextStyle={{ color: colors.primary }}
            containerStyle={{
              borderWidth: vw(1),
              borderColor: colors.primary,
              backgroundColor: colors.backgroundColor,
            }}
          />
          {/* <TouchableOpacity style={styles.manualBtn} activeOpacity={0.8}>
            <TextAtom numberOfLines={2} style={styles.manualText}>
              {strings.download_manual}
            </TextAtom>
          </TouchableOpacity> */}
        </ViewAtom>

        <ViewAtom style={styles.footerWrapper}>
          <TextAtom style={styles.copyright}>{strings.copyright}</TextAtom>
          <TextAtom style={styles.footerText}>
            {strings.designed_by}{' '}
            <Text style={styles.hyperlink} onPress={handleCodeBucketLink}>
              {strings.codebucket}
            </Text>
          </TextAtom>
        </ViewAtom>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Login;

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
  rememberForgotWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: vw(330),
    marginTop: vh(5),
    marginBottom: vh(20),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  checkboximg: {
    width: vw(19),
    height: vw(19),
    resizeMode: 'contain',
  },
  rememberText: {
    fontFamily: fonts.Roboto_Medium,
    fontSize: vw(12),
    color: colors.grey,
    marginLeft: vw(5),
  },
  forgotText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.primary,
  },
  manualBtn: {
    width: vw(150),
    height: vh(50),
    borderRadius: vw(8),
    borderWidth: vw(1),
    borderColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: vw(4),
  },
  manualText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(12),
    color: colors.grey,
    textAlign: 'center',
  },
  copyright: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(10),
    color: colors.grey,
    textAlign: 'center',
  },
  footerText: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(10),
    color: colors.grey,
    textAlign: 'center',
  },
  hyperlink: {
    fontFamily: fonts.Roboto_Regular,
    fontSize: vw(10),
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  formWrapper: {
    flex: 1,
    marginTop: vh(20),
    paddingHorizontal: vh(15),
  },
  footerWrapper: {
    marginTop: vh(30),
  },
});
