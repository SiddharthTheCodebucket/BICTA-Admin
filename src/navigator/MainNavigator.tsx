import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../constants';
import { navigationRef } from './RootNavigation';
import Splash from '../screens/Splash';
import Login from '../screens/OnBoarding/Login';
import ForgotPassword from '../screens/OnBoarding/ForgotPassword';
import RootNavigatorAdmin from './RootNavigatorAdmin';
import TraineeRootNavigator from './TraineeRootNavigator';
import DropDownModal from '../modal/DropDownModal';
import { useAppSelector } from '../hooks';
import RegistrationSteeper from '../screens/OnBoarding/Register/RegistrationSteeper';
import QRCodeScan from '../screens/OnBoarding/Register/QRCodeScan';

const OnBoardingStack = createNativeStackNavigator();

const OnBoardingNavigator = () => (
  <OnBoardingStack.Navigator
    screenOptions={{
      animation: 'slide_from_right',
      headerShadowVisible: false,
      headerShown: false,
      gestureEnabled: false,
    }}
  >
    <OnBoardingStack.Screen
      name={screensName.Login}
      component={Login}
      options={{ headerShadowVisible: false }}
    />
    <OnBoardingStack.Screen
      name={screensName.ForgotPassword}
      component={ForgotPassword}
      options={{ headerShadowVisible: false }}
    />
    <OnBoardingStack.Screen
      name={screensName.RegistrationSteeper}
      component={RegistrationSteeper}
      options={{ headerShadowVisible: false }}
    />
    <OnBoardingStack.Screen
      name={screensName.QRCodeScan}
      component={QRCodeScan}
      options={{ headerShadowVisible: false }}
    />
  </OnBoardingStack.Navigator>
);

const MainNavigator = () => {
  const RootStackScreen = createNativeStackNavigator();
  const { token, crediantialData } = useAppSelector(state => state.Auth);

  let userType = crediantialData?.user?.[0]?.userType?.toUpperCase();

  return (
    <NavigationContainer ref={navigationRef}>
      <RootStackScreen.Navigator>
        <RootStackScreen.Group
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            headerShadowVisible: false,
          }}
        >
          <RootStackScreen.Screen name="Splash" component={Splash} />
          <RootStackScreen.Screen
            name="OnBoardingNavigator"
            component={OnBoardingNavigator}
          />
          <RootStackScreen.Screen
            name="TraineeRootNavigator"
            component={TraineeRootNavigator}
          />
          <RootStackScreen.Screen
            name="RootNavigatorAdmin"
            component={RootNavigatorAdmin}
          />
        </RootStackScreen.Group>
        <RootStackScreen.Group
          screenOptions={{
            headerShown: false,
            presentation: 'transparentModal',
          }}
        >
          <RootStackScreen.Screen
            name={screensName.DropDownModal}
            component={DropDownModal}
            options={{
              animation: 'fade',
              headerShown: false,
              headerShadowVisible: false,
            }}
          />
        </RootStackScreen.Group>
      </RootStackScreen.Navigator>
    </NavigationContainer>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({});
