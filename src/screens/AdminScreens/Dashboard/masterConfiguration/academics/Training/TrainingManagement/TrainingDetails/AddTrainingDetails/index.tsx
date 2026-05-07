/* eslint-disable eslint-comments/no-unused-disable, react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars */
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import StepHeader from '../../../../../../../../../components/organisms/StepHeader';

import {
  Header,
  NavigationType,
} from '../../../../../../../../../components/organisms/HeaderOrganism';
import {
  colors,
  fonts,
  screensName,
  strings,
  vh,
  vw,
} from '../../../../../../../../../constants';
import { useAndroidBackButton } from '../../../../../../../../../hooks/behaviour';
import FullscreenLoading from '../../../../../../../../../components/organisms/FullscreenLoading';

import General from './General';
import DescAndHostel from './DescAndHostel';
import TrainingTeamLocation from './TrainingTeamLocation';

import {
  resetTrainingManagementState,
  setTrainingEditData,
} from '../../../../../../../../../features/TrainingManagement/trainingManagementSlice';

interface Props {
  navigation: NavigationType;
  route: any;
}

const AddTrainingDetails = ({ navigation, route }: Props) => {
  const item = route?.params?.item; // 🔥 EDIT ITEM
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);

  // 🔥 STEP 1 — EDIT MODE PREFILL
  useEffect(() => {
    if (item) {
      dispatch(setTrainingEditData(item));
    }
  }, [item]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      item ? 'Edit Training Details' : 'Add Training Details',
    );

    navigation.BackButtonPress = () => {
      navigation.navigate(screensName.AlertOrganism, {
        message: item
          ? 'Are you sure you want to exit from Edit Training Details Process?'
          : 'Are you sure you want to exit from Add Training Details Process?',
        okText: strings.ok,
        double: true,
        cancelText: strings.cancel,
        okFunction: () => {
          navigation.goBack();
          dispatch(resetTrainingManagementState());
        },
        cancelFunction: () => {},
      });
    };
  }, []);

  useAndroidBackButton(() => {
    navigation.navigate(screensName.AlertOrganism, {
      message: item
        ? 'Are you sure you want to exit from Edit Training Details Process?'
        : 'Are you sure you want to exit from Registration Process?',
      okText: strings.ok,
      double: true,
      cancelText: strings.cancel,
      okFunction: () => {
        dispatch(resetTrainingManagementState());
        navigation.goBack();
      },
      cancelFunction: () => {},
    });
    return true;
  }, [navigation]);

  const [loader] = useState(false);

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
        {item ? 'Edit Training' : 'Registration'}
      </Text>

      <StepHeader currentStep={step} />

      <View style={{ flex: 1 }}>
        {/* 🔥 STEP 2 — route pass karein */}
        <ScreenComponent
          navigation={navigation}
          route={route}
          goNext={goNext}
          goBack={goBack}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddTrainingDetails;
