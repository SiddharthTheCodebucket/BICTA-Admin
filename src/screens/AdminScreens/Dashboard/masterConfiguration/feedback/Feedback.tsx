import { StyleSheet } from 'react-native';
import React, { useLayoutEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import { colors } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';

import CategoryTab from './CategoryTab';
import SubCategoryTab from './SubCategoryTab';
import TopicTab from './TopicTab';
import TopTabBar from '../../../../../components/templates/TopTabBar';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();
const renderTopTabBar = (tabProps: any) => <TopTabBar {...tabProps} />;

const FeedbackMaster = (props: Props) => {
  const { navigation, route } = props;

  const initialRouteName = useMemo(() => {
    const initialTab = route?.params?.initialTab;
    if (initialTab) return `${initialTab}Tab`;
    return 'CategoryTab';
  }, [route?.params?.initialTab]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Feedback',
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
          name="CategoryTab"
          component={CategoryTab}
          options={{ tabBarLabel: 'Category' }}
        />
        <TopTabs.Screen
          name="SubCategoryTab"
          component={SubCategoryTab}
          options={{ tabBarLabel: 'Sub Category' }}
        />
        <TopTabs.Screen
          name="TopicTab"
          component={TopicTab}
          options={{ tabBarLabel: 'Topic' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default FeedbackMaster;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
