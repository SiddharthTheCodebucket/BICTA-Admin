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
import BookStock from './BookStock';
import BookIssuance from './BookIssuance';

interface Props {
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const Library = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      'Library',
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
          name="BookStockTab"
          component={BookStock}
          options={{ tabBarLabel: 'Book Stock' }}
        />
        <TopTabs.Screen
          name="BookIssuanceTab"
          component={BookIssuance}
          options={{ tabBarLabel: 'Book Issuance' }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default Library;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
});
