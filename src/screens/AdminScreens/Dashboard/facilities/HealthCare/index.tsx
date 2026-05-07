import { StyleSheet } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import TopTabBar from '../../../../../components/templates/TopTabBar';
import BasicPatientDetails from './PHCManagemnetMain/BasicPatientDetails';
import Patients from './Pharmacy/Patients';
import UpdateStock from './Pharmacy/UpdateStock';
import StockReport from './Pharmacy/StockReport';
import BMI from './TraineeBMI/BMI';

interface Props {
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const HealthCare = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Health Care',
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
        tabBar={tabBarProps => <TopTabBar {...tabBarProps} />}
        screenOptions={{
          swipeEnabled: true,
          sceneStyle: {
            backgroundColor: colors.new_ui_screen_bg,
          },
        }}
      >
        <TopTabs.Screen
          name="BasicPatientDetailsTab"
          component={BasicPatientDetails}
          options={{ tabBarLabel: 'Basic Patient Details' }}
        />
        <TopTabs.Screen
          name="PrescriptionTab"
          component={Patients}
          options={{ tabBarLabel: 'Prescription' }}
        />
        <TopTabs.Screen
          name="StockUpdateTab"
          component={UpdateStock}
          options={{ tabBarLabel: 'Stock Update' }}
        />
        <TopTabs.Screen
          name="StockReportTab"
          component={StockReport}
          options={{ tabBarLabel: 'Stock Report' }}
        />
        <TopTabs.Screen
          name="TraineeBMITab"
          component={BMI}
          options={{ tabBarLabel: 'Trainee BMI' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default HealthCare;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
