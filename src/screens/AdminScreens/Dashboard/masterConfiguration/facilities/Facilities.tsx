import { StyleSheet } from 'react-native';
import React, { useLayoutEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors, fonts, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';

import HostelDetailsList from '../../../Menu/HostelManagement/Hostel/HostelDetails/HostelDetailsList';
import Pharmacy from './pharmacy/Pharmacy';
import HouseKeepingManagement from '../../../Menu/HouseKeepingManagement';
import MessMaster from '../../../Menu/MessManagement/MessMaster';
import StockDetails from '../../../Menu/MessManagement/StockDetails';
import LibraryMaster from './/LibraryMaster';
import VehicleManagement from '../../../Menu/VehicleManagement';
import TopTabBar from '../../../../../components/templates/TopTabBar';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const Facilities = (props: Props) => {
  const { navigation, route } = props;

  const initialRouteName = useMemo(() => {
    const initialTab = route?.params?.initialTab;
    if (initialTab) return `${initialTab}Tab`;
    return 'HostelTab';
  }, [route?.params?.initialTab]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Facilities',
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
  }, []);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <TopTabs.Navigator
        key={initialRouteName}
        initialRouteName={initialRouteName}
        tabBar={props => <TopTabBar {...props} />}
        screenOptions={{
          swipeEnabled: true,
          sceneStyle: {
            backgroundColor: colors.new_ui_screen_bg,
          },
        }}
      >
        <TopTabs.Screen
          name="HostelTab"
          component={HostelDetailsList}
          options={{ tabBarLabel: 'Hostel Master' }}
        />
        <TopTabs.Screen
          name="PharmacyTab"
          component={Pharmacy}
          options={{ tabBarLabel: 'Pharmacy' }}
        />
        <TopTabs.Screen
          name="HouseKeepingTab"
          component={HouseKeepingManagement}
          options={{ tabBarLabel: 'Housekeeping Master' }}
        />
        <TopTabs.Screen
          name="MessMasterTab"
          component={MessMaster}
          options={{ tabBarLabel: 'Mess Master' }}
        />
        <TopTabs.Screen
          name="MessInventoryTab"
          component={StockDetails}
          options={{ tabBarLabel: 'Mess Inventory Master' }}
        />
        <TopTabs.Screen
          name="LibraryTab"
          component={LibraryMaster}
          options={{ tabBarLabel: 'Library Master' }}
        />
        <TopTabs.Screen
          name="VehicleTab"
          component={VehicleManagement}
          options={{ tabBarLabel: 'Vehicle Master' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default Facilities;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
