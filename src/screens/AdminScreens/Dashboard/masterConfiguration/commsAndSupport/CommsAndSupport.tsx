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

import CategoryTab from './CategoryTab';
import SubCategoryTab from './SubCategoryTab';
import IssueTypeTab from './IssueTypeTab';
import QuestionFieldsTab from './QuestionFieldsTab';
import TopTabBar from '../../../../../components/templates/TopTabBar';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const CommsAndSupport = (props: Props) => {
  const { navigation, route } = props;

  const initialRouteName = useMemo(() => {
    const initialTab = route?.params?.initialTab;
    if (initialTab) return `${initialTab}Tab`;
    return 'CategoryTab';
  }, [route?.params?.initialTab]);

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Comms & Support',
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
          name="IssueTypeTab"
          component={IssueTypeTab}
          options={{ tabBarLabel: 'Issue Type' }}
        />
        <TopTabs.Screen
          name="QuestionFieldsTab"
          component={QuestionFieldsTab}
          options={{ tabBarLabel: 'Question Fields' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default CommsAndSupport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
