import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import StepHeader from '../../../../../../components/organisms/StepHeader';

import {
  Header,
  NavigationType,
} from '../../../../../../components/organisms/HeaderOrganism';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../constants';
import { useAndroidBackButton } from '../../../../../../hooks/behaviour';
import { useAppSelector } from '../../../../../../hooks';
import FullscreenLoading from '../../../../../../components/organisms/FullscreenLoading';
import General from './General';
import DescAndHostel from './DescAndHostel';
import TrainingTeamLocation from './TrainingTeamLocation';

interface Props {
  navigation: NavigationType;
  route: any;
}

const AddTrainingDetails = ({ navigation, route }: Props) => {
  const qrData = route?.params?.qrData;
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);

  useLayoutEffect(() => {
    Header.setNavigation(navigation, 'Add Training Details');
    navigation.BackButtonPress = () => {
      navigation.navigate(screensName.AlertOrganism, {
        message:
          'Are you sure you want to exit from Add Training Details Process?',
        okText: strings.ok,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          navigation.goBack();
          //   dispatch(resetRegistrationState());
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
        // dispatch(resetRegistrationState());
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
    (props: any) => <General {...props} />,
    (props: any) => <DescAndHostel {...props} />,
    (props: any) => <TrainingTeamLocation {...props} />,
  ];

  const ScreenComponent = screens[step];

  return (
    <SafeAreaView
      edges={['bottom']}
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

export default AddTrainingDetails;
