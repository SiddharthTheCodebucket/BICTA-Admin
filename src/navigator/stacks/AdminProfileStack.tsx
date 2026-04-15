import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../../constants';
import Profile from '../../screens/AdminScreens/Profile';
import ScanQRAndFace from '../../screens/AdminScreens/Profile/ScanQRAndFace';
import DeviceRegistration from '../../screens/AdminScreens/Profile/FaceScan/DeviceRegistration';
import DeviceList from '../../screens/AdminScreens/Profile/FaceScan/DeviceList';

const Stack = createNativeStackNavigator();

const AdminProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={screensName.Profile} component={Profile} />
      <Stack.Screen
        name={screensName.ScanQRAndFace}
        component={ScanQRAndFace}
      />
      <Stack.Screen
        name={screensName.DeviceRegistration}
        component={DeviceRegistration}
      />
      <Stack.Screen name={screensName.DeviceList} component={DeviceList} />
    </Stack.Navigator>
  );
};

export default AdminProfileStack;
