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
import TaskDetails from './HouseKeepingManagementMain/TaskDetails';
import Feedback from './Feedback';

interface Props {
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const HouseKeeping = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'House Keeping',
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
          name="HouseKeepingDetailsTab"
          component={TaskDetails}
          options={{ tabBarLabel: 'Details' }}
        />
        <TopTabs.Screen
          name="HouseKeepingFeedbackTab"
          component={Feedback}
          options={{ tabBarLabel: 'Feedback' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default HouseKeeping;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
