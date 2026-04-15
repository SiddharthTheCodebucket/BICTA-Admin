import React from 'react';
import { Image, Platform, Pressable, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { vh, vw } from '../constants/dimensions';
import { colors, fonts, images, screensName } from '../constants';
import Dashboard from './stacks/AdminDashboardStack';
import Menu from './stacks/AdminMenuStack';
import Profile from './stacks/AdminProfileStack';
import { useAppSelector } from '../hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomTab = createBottomTabNavigator();

const renderHomeIcon = () => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const isTablet = width >= 768;

  return ({ focused }: any) => (
    <Image
      source={focused ? images.home_active : images.home_inactive}
      style={isTablet ? styles.iconStyleTablet : styles.iconStyle}
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
  const insets = useSafeAreaInsets();
  const userType: string | undefined = crediantialData?.user?.[0]?.userType;
  const globalPermissions = crediantialData?.globalPermissions || [];
  const { width, height } = require('react-native').Dimensions.get('window');
  const isTablet = width >= 768;
  const isLandscape = width > height;
  const isDedicatedScanner =
    globalPermissions.length === 1 &&
    globalPermissions[0]?.roleName === 'QR CODE SCANNER DEVICE';

  const canSeeInvoice = userType === 'ACCOUNTCONTROLLER';
  const isAndroid = Platform.OS === 'android';
  const bottomInset = isAndroid ? Math.max(insets.bottom, 0) : 0;

  return (
    <BottomTab.Navigator
      screenOptions={{
        tabBarInactiveTintColor: colors.grey,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: vh(65) + bottomInset,
            paddingBottom: bottomInset,
          },
        ],
        tabBarButton: renderTabBarButton,
        headerShown: false,
      }}
    >
      {!canSeeInvoice && !isDedicatedScanner && (
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

      {!isDedicatedScanner && (
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
      )}

      <BottomTab.Screen
        name={screensName.Profile}
        component={Profile}
        options={{
          tabBarLabel: isDedicatedScanner ? 'Home' : 'Profile',
          tabBarIcon: isDedicatedScanner
            ? renderHomeIcon()
            : renderProfileIcon(),
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
  iconStyleTablet: {
    width: vw(10),
    height: vw(10),
    resizeMode: 'contain',
  },
  tabBarLabel: {
    fontSize: vw(10),
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
