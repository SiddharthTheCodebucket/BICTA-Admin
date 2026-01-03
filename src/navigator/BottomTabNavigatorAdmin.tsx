import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { vh, vw } from '../constants/dimensions';
import { colors, fonts, images, screensName } from '../constants';
import Dashboard from '../screens/AdminScreens/Dashboard';
import Menu from '../screens/AdminScreens/Menu';
import Profile from '../screens/AdminScreens/Profile';
import { useAppSelector } from '../hooks';

const BottomTab = createBottomTabNavigator();

const renderHomeIcon = () => {
  return ({ focused }: any) => (
    <Image
      source={focused ? images.home_active : images.home_inactive}
      style={styles.iconStyle}
    />
  );
};

const renderMenuIcon = () => {
  return ({ focused }: any) => (
    <Image
      source={focused ? images.menu_active : images.menu_inactive}
      style={styles.iconStyle}
    />
  );
};

const renderProfileIcon = () => {
  return ({ focused }: any) => (
    <Image
      source={focused ? images.profile_active : images.profile_inactive}
      style={styles.iconStyle}
    />
  );
};

const renderTabBarButton = (props: any) => {
  return <Pressable {...props}>{props.children}</Pressable>;
};

function BottomTabNavigatorAdmin() {
  const { crediantialData } = useAppSelector(state => state.Auth);

  const userType: string | undefined = crediantialData?.user?.[0]?.userType;

  const canSeeInvoice = userType === 'ACCOUNTCONTROLLER';

  return (
    <BottomTab.Navigator
      screenOptions={{
        tabBarInactiveTintColor: colors.grey,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        tabBarButton: renderTabBarButton,
        headerShown: false,
      }}
    >
      {!canSeeInvoice && (
        <BottomTab.Screen
          name={screensName.Dashboard}
          component={Dashboard}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: renderHomeIcon(),
          }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              navigation.navigate(screensName.Dashboard);
            },
          })}
        />
      )}

      <BottomTab.Screen
        name={screensName.Menu}
        component={Menu}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: renderMenuIcon(),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate(screensName.Menu);
          },
        })}
      />

      <BottomTab.Screen
        name={screensName.Profile}
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: renderProfileIcon(),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate(screensName.Profile);
          },
        })}
      />
    </BottomTab.Navigator>
  );
}

export default BottomTabNavigatorAdmin;

const styles = StyleSheet.create({
  iconStyle: {
    width: vw(24),
    height: vw(24),
    resizeMode: 'contain',
    marginTop: vh(5),
  },
  tabBarLabel: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    marginTop: vh(5),
    color: colors.primary,
  },
  tabBar: {
    backgroundColor: colors.white,
    height: vh(65),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
    zIndex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.lightGrey,
  },
});
