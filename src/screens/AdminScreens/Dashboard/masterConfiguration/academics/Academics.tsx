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
import { colors, fonts, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';

import TraineeDesignationMaster from './TraineeDesignation/TraineeDesignationMaster';
import FacultyDetailsList from '../../../Menu/LMS/FacultyManagement/FacultyDetails/FacultyDetailsList';
import { FacultyCenterProvider } from '../../../Menu/LMS/FacultyManagement/context/FacultyCenterContext';
import Subject from '../../../Menu/LMS/CurriculumManagemnet/Subject';
import SubjectTopicList from '../../../Menu/LMS/CurriculumManagemnet/SubjectTopic/SubjectTopicList';
import LocationDetailsList from '../../../Menu/LMS/ClassLocationManagement/LocationDetails/LocationDetailsList';
import { TrainingCategoryMaster } from './TrainingCategoryMaster';
import TopTabBar from '../../../../../components/templates/TopTabBar';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const Academics = (props: Props) => {
  const { navigation, route } = props;

  const initialRouteName = useMemo(() => {
    const initialTab = route?.params?.initialTab;
    if (initialTab) return `${initialTab}Tab`;
    return 'TrainingCategoryTab';
  }, [route?.params?.initialTab]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Academics',
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
          name="TrainingCategoryTab"
          component={TrainingCategoryMaster}
          options={{ tabBarLabel: 'Training Category' }}
        />
        <TopTabs.Screen
          name="TraineeDesignationTab"
          component={TraineeDesignationMaster}
          options={{ tabBarLabel: 'Trainee Designation' }}
        />
        <TopTabs.Screen
          name="FacultyDetailsTab"
          component={(props: any) => (
            <FacultyCenterProvider>
              <FacultyDetailsList {...props} />
            </FacultyCenterProvider>
          )}
          options={{ tabBarLabel: 'Faculty Details' }}
        />
        <TopTabs.Screen
          name="SubjectTab"
          component={Subject}
          options={{ tabBarLabel: 'Subject' }}
        />
        <TopTabs.Screen
          name="SubjectTopicTab"
          component={SubjectTopicList}
          options={{ tabBarLabel: 'Subject Topic' }}
        />
        <TopTabs.Screen
          name="LocationTab"
          component={LocationDetailsList}
          options={{ tabBarLabel: 'Location' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default Academics;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
