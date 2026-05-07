import React, { useLayoutEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TopTabBar from '../../../../../components/templates/TopTabBar';
import AssignVehicle from './AssignVehicle';
import CreateTour from './CreateTour';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const renderTopTabBar = (props: any) => <TopTabBar {...props} />;

const VehicleManagement = ({ navigation, route }: Props) => {
  const initialRouteName = useMemo(() => {
    const initialTab = route?.params?.initialTab;
    if (initialTab) return `${initialTab}Tab`;
    return 'AssignVehicleTab';
  }, [route?.params?.initialTab]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Vehicle',
      undefined,
      undefined,
      undefined,
      {
        backgroundColor: colors.primary_dark_blue,
        titleColor: colors.white,
        backIconColor: colors.white,
      },
      true,
    );
    navigation.BackButtonPress = () => {
      navigation.goBack();
    };
  }, [navigation]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <TopTabs.Navigator
        key={initialRouteName}
        initialRouteName={initialRouteName}
        tabBar={renderTopTabBar}
        screenOptions={{
          swipeEnabled: true,
          sceneStyle: {
            backgroundColor: colors.new_ui_screen_bg,
          },
        }}
      >
        <TopTabs.Screen
          name="AssignVehicleTab"
          component={AssignVehicle}
          options={{ tabBarLabel: 'Assign Vehicle' }}
        />
        <TopTabs.Screen
          name="TourTab"
          component={CreateTour}
          options={{ tabBarLabel: 'Tour' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default VehicleManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
