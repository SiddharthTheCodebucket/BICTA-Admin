import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../../constants';
import Dashboard from '../../screens/AdminScreens/Dashboard';
import HostelPlanningDetails from '../../screens/AdminScreens/Dashboard/Hostel/HostelPlanningDetails';
import HostelDetailsDashbaord from '../../screens/AdminScreens/Dashboard/Hostel/HostelDetailsDashbaord';
import BlockDetails from '../../screens/AdminScreens/Dashboard/Hostel/BlockDetails';
import BlockedForm from '../../screens/AdminScreens/Dashboard/Hostel/BlockedForm';

const Stack = createNativeStackNavigator();

const AdminDashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={screensName.Dashboard} component={Dashboard} />
      <Stack.Screen
        name={screensName.HostelPlanningDetails}
        component={HostelPlanningDetails}
      />
      <Stack.Screen
        name={screensName.HostelDetailsDashbaord}
        component={HostelDetailsDashbaord}
      />
      <Stack.Screen name={screensName.BlockDetails} component={BlockDetails} />
      <Stack.Screen name={screensName.BlockedForm} component={BlockedForm} />
    </Stack.Navigator>
  );
};

export default AdminDashboardStack;
