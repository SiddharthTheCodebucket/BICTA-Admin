import {
  StyleSheet,
} from 'react-native';
import React, {
  useLayoutEffect,
  useMemo,
} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import { colors, fonts, vh, vw } from '../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../components/organisms/HeaderOrganism';

import CourseWise from '../../Menu/Report/FacultyReport/CourseWise';
import FacultyWiseClassReport from '../../Menu/Report/FacultyReport/FacultyWiseClassReport';
import FacultyCalculationSheet from '../../Menu/Report/FacultyReport/FacultyCalculationSheet';
import CourseWiseApprovalStatus from '../../Menu/Report/FacultyReport/CourseWiseApprovalStatus';
import FacultyClassReportTrainingWise from '../../Menu/Report/FacultyReport/FacultyClassReportTrainingWise';
import TopTabBar from '../../../../components/templates/TopTabBar';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const FacultyReportMaster = (props: Props) => {
  const { navigation, route } = props;

  const initialRouteName = useMemo(() => {
    const initialTab = route?.params?.initialTab;
    if (initialTab) return `${initialTab}Tab`;
    return 'CourseWiseTab';
  }, [route?.params?.initialTab]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Faculty Report',
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
          name="CourseWiseTab"
          component={CourseWise}
          options={{ tabBarLabel: 'Course wise' }}
        />
        <TopTabs.Screen
          name="FacultyWiseTab"
          component={FacultyWiseClassReport}
          options={{ tabBarLabel: 'Faculty wise' }}
        />
        <TopTabs.Screen
          name="CalculationSheetTab"
          component={FacultyCalculationSheet}
          options={{ tabBarLabel: 'Calculation sheet' }}
        />
        <TopTabs.Screen
          name="ApprovalTab"
          component={CourseWiseApprovalStatus}
          options={{ tabBarLabel: 'Training wise approval' }}
        />
        <TopTabs.Screen
          name="ClassReportTab"
          component={FacultyClassReportTrainingWise}
          options={{ tabBarLabel: 'Faculty class report training wise' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default FacultyReportMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
