import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import StepHeader from '../../../components/organisms/StepHeader';
import PersonalInfo from './PersonalInfo';
import Uploads from './Uploads';
import Confirm from './Confirm';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../constants';
import { useAndroidBackButton } from '../../../hooks/behaviour';
import {
  resetRegistrationState,
  saveRegistrationState,
} from '../../../featuresTrainee/Registration/registrationSlice';
import { useCommonDropdownListMutation } from '../../../injectEndpointsTrainee/profileEndpoints';

import FullscreenLoading from '../../../components/organisms/FullscreenLoading';

interface Props {
  navigation: NavigationType;
  route: any;
}

const RegistrationSteeper = ({ navigation, route }: Props) => {
  const qrData = route?.params?.qrData;
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [commonDropdownListApi] = useCommonDropdownListMutation();

  useEffect(() => {
    const parts = qrData?.split('/');

    const centerId = Number(parts[parts.length - 5]);
    const trainingId = Number(parts[parts.length - 3]);
    const qrType = parts[parts.length - 2];
    getTrainingList(trainingId, centerId);
    if (centerId === 3125) {
      dispatch(
        dispatch(
          saveRegistrationState({
            trainingCenter: { id: centerId, name: 'Gaya' },
          }),
        ),
      );
    } else {
      dispatch(
        saveRegistrationState({
          trainingCenter: { id: centerId, name: 'Patna' },
        }),
      );
    }
    dispatch(
      saveRegistrationState({
        qrData: { trainingId: trainingId, qrType: qrType },
      }),
    );
  }, [qrData]);

  useEffect(() => {
    getGender();
    getMaritalStatus();
    getDepartment();
    getBloodGroup();
  }, []);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'BIPARD');
    navigation.BackButtonPress = () => {
      navigation.navigate(screensName.AlertOrganism, {
        message: 'Are you sure you want to exit from Registration Process?',
        okText: strings.ok,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          navigation.goBack();
          dispatch(resetRegistrationState());
        },
        cancelFunction: () => {},
      });
    };
  }, []);

  useAndroidBackButton(() => {
    navigation.navigate(screensName.AlertOrganism, {
      message: 'Are you sure you want to exit from Registration Process?',
      okText: strings.ok,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        dispatch(resetRegistrationState());
        navigation.goBack();
      },
      cancelFunction: () => {},
    });
    return true;
  }, [navigation]);

  const [loader, setLoader] = useState(false);

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => s - 1);

  const screens = [
    (props: any) => <PersonalInfo {...props} />,
    (props: any) => <Uploads {...props} />,
    (props: any) => <Confirm {...props} />,
  ];

  const ScreenComponent = screens[step];

  const getTrainingList = (trainingId: any, centerId: number) => {
    const params = {
      listType: 'training_list_without_login',
      replacements: [
        centerId === 3125 ? 'Gaya' : 'Patna',
        centerId === 3125 ? 'Gaya' : 'Patna',
        '%%',
      ],
    };

    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        setLoader(false);

        let list = res?.data || [];

        const matched = list?.find(
          (item: any) => Number(item.id) === Number(trainingId),
        );
        if (matched?.name) {
          dispatch(
            saveRegistrationState({
              trainingName: matched.name,
            }),
          );
        }
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

  const getGender = () => {
    setLoader(true);
    const params = {
      listType: 'gender',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(
          saveRegistrationState({
            genderList: res.data,
          }),
        );

        setLoader(false);
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

  const getMaritalStatus = () => {
    const params = {
      listType: 'marital_status',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(
          saveRegistrationState({
            maritalStatusList: res.data,
          }),
        );
        setLoader(false);
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

  const getDepartment = () => {
    setLoader(true);
    const params = {
      listType: 'training_department',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(
          saveRegistrationState({
            departmentList: res.data,
          }),
        );
        setLoader(false);
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

  const getBloodGroup = () => {
    setLoader(true);
    const params = {
      listType: 'select_blood_group',
      replacements: ['%%'],
    };
    commonDropdownListApi(params)
      .unwrap()
      .then((res: any) => {
        dispatch(
          saveRegistrationState({
            bloodGroupList: res.data,
          }),
        );
        setLoader(false);
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
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: vw(15),
        paddingTop: vh(10),
        backgroundColor: colors.backgroundColor,
      }}
    >
      <FullscreenLoading isVisible={loader} />
      <Text
        style={{
          fontFamily: fonts.Roboto_Bold,
          fontSize: vw(18),
          color: colors.black,
        }}
      >
        Registration
      </Text>

      <StepHeader currentStep={step} />

      <View style={{ flex: 1 }}>
        <ScreenComponent
          navigation={navigation}
          goNext={goNext}
          goBack={goBack}
        />
      </View>
      {/* 
      <View style={styles.footer}>
        {step > 0 && (
          <ButtonOrganism
            containerStyle={{ width: vw(150) }}
            bttnText="Back"
            onPress={goBack}
          />
        )}

        <View style={{ width: 12 }} />

        {step < screens.length - 1 ? (
          <ButtonOrganism
            containerStyle={{ width: step === 0 ? vw(328) : vw(150) }}
            bttnText="Next"
            onPress={goNext}
          />
        ) : (
          <ButtonOrganism
            containerStyle={{ width: vw(150) }}
            bttnText="Submit"
            onPress={() => {}}
          />
        )}
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
});

export default RegistrationSteeper;
