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
import StockConsumption from './StockDetails/StockConsumption';
import Item from './MessMaster/Item';
import Feedback from './Feedback';

interface Props {
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const Mess = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Mess',
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
          name="MessAllocationTab"
          component={StockConsumption}
          options={{ tabBarLabel: 'Allocation' }}
        />
        <TopTabs.Screen
          name="MessItemTab"
          component={Item}
          options={{ tabBarLabel: 'Item' }}
        />
        <TopTabs.Screen
          name="MessFeedbackTab"
          component={Feedback}
          options={{ tabBarLabel: 'Feedback' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default Mess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
