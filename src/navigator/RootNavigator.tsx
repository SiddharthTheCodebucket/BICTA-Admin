import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../constants';
import { navigationRef } from './RootNavigation';
import Splash from '../screens/Splash';
import DropDownModal from '../modal/DropDownModal';
import AlertOrganism from '../components/organisms/AlertOrganism';
import ErrorModal from '../components/organisms/ErrorModal';
import Login from '../screens/OnBoarding/Login';
import ForgotPassword from '../screens/OnBoarding/ForgotPassword';
import BottomTabNavigator from './BottomTabNavigator';
import ShowCaseNoticeModal from '../modal/ShowCaseNoticeModal';

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
  </OnBoardingStack.Navigator>
);

const RootNavigator = () => {
  const RootStackScreen = createNativeStackNavigator();
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
            options={{ headerShadowVisible: false }}
          />
          <RootStackScreen.Screen
            name="BottomTabNavigator"
            component={BottomTabNavigator}
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
          <RootStackScreen.Screen
            name={'ErrorModal'}
            component={ErrorModal}
            options={{
              animation: 'fade',
              headerShown: false,
              headerShadowVisible: false,
            }}
          />
          <RootStackScreen.Screen
            name={screensName.AlertOrganism}
            component={AlertOrganism}
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

export default RootNavigator;

const styles = StyleSheet.create({});
