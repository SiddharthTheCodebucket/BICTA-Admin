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
import VehicleManagement from '../screens/Menu/VehicleManagement';
import VehicleRegistration from '../screens/Menu/VehicleManagement/VehicleRegistration';
import AddVehicle from '../screens/Menu/VehicleManagement/VehicleRegistration/AddVehicle';
import AssignVehicle from '../screens/Menu/VehicleManagement/AssignVehicle';
import DriverMovementHistory from '../screens/Menu/VehicleManagement/AssignVehicle/DriverMovementHistory';
import AddAssignVehicle from '../screens/Menu/VehicleManagement/AssignVehicle/AddAssignVehicle';
import CreateTour from '../screens/Menu/VehicleManagement/CreateTour';
import CreateTourDetails from '../screens/Menu/VehicleManagement/CreateTour/CreateTourDetails';
import AddCreateTour from '../screens/Menu/VehicleManagement/CreateTour/AddCreateTour';
import HostelManagement from '../screens/Menu/HostelManagement';
import Guest from '../screens/Menu/HostelManagement/Guest';
import AddGuest from '../screens/Menu/HostelManagement/Guest/AddGuest';
import Hostel from '../screens/Menu/HostelManagement/Hostel';
import HostelDetails from '../screens/Menu/HostelManagement/Hostel/HostelDetails';
import AddHostelDetails from '../screens/Menu/HostelManagement/Hostel/HostelDetails/AddHostelDetails';
import FloorDetails from '../screens/Menu/HostelManagement/Hostel/FloorDetails';
import AddFloorDetails from '../screens/Menu/HostelManagement/Hostel/FloorDetails/AddFloorDetails';
import RoomDetails from '../screens/Menu/HostelManagement/Hostel/RoomDetails';
import AddRoomDetails from '../screens/Menu/HostelManagement/Hostel/RoomDetails/AddRoomDetails';
import BedDetails from '../screens/Menu/HostelManagement/Hostel/BedDetails';
import AddBedDetails from '../screens/Menu/HostelManagement/Hostel/BedDetails/AddBedDetails';
import BedAvailability from '../screens/Menu/HostelManagement/Hostel/BedAvailability';

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
          <RootStackScreen.Screen
            name="VehicleManagement"
            component={VehicleManagement}
          />
          <RootStackScreen.Screen
            name="VehicleRegistration"
            component={VehicleRegistration}
          />
          <RootStackScreen.Screen name="AddVehicle" component={AddVehicle} />
          <RootStackScreen.Screen
            name="AssignVehicle"
            component={AssignVehicle}
          />
          <RootStackScreen.Screen
            name="DriverMovementHistory"
            component={DriverMovementHistory}
          />
          <RootStackScreen.Screen
            name="AddAssignVehicle"
            component={AddAssignVehicle}
          />
          <RootStackScreen.Screen name="CreateTour" component={CreateTour} />
          <RootStackScreen.Screen
            name="CreateTourDetails"
            component={CreateTourDetails}
          />
          <RootStackScreen.Screen
            name="AddCreateTour"
            component={AddCreateTour}
          />
          <RootStackScreen.Screen
            name="HostelManagement"
            component={HostelManagement}
          />
          <RootStackScreen.Screen name="Guest" component={Guest} />
          <RootStackScreen.Screen name="AddGuest" component={AddGuest} />
          <RootStackScreen.Screen name="Hostel" component={Hostel} />
          <RootStackScreen.Screen
            name="HostelDetails"
            component={HostelDetails}
          />
          <RootStackScreen.Screen
            name="AddHostelDetails"
            component={AddHostelDetails}
          />
          <RootStackScreen.Screen
            name="FloorDetails"
            component={FloorDetails}
          />
          <RootStackScreen.Screen
            name="AddFloorDetails"
            component={AddFloorDetails}
          />
          <RootStackScreen.Screen name="RoomDetails" component={RoomDetails} />
          <RootStackScreen.Screen
            name="AddRoomDetails"
            component={AddRoomDetails}
          />
          <RootStackScreen.Screen name="BedDetails" component={BedDetails} />
          <RootStackScreen.Screen
            name="AddBedDetails"
            component={AddBedDetails}
          />
          <RootStackScreen.Screen
            name="BedAvailability"
            component={BedAvailability}
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
