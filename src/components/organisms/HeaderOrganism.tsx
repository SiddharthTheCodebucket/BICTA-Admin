import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ParamListBase, DrawerActions } from '@react-navigation/native';
import { colors, fonts, images, vh, vw } from '../../constants';
import ImageAtom from '../atoms/ImageAtom';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface NavigationType
  extends NativeStackNavigationProp<ParamListBase> {
  BackButtonPress: Function;
  onCartBttnPress: Function;
}
export interface RouteType {
  key: any;
  name: any;
  params: any;
  path: any;
}

interface HeaderNavigationOptions {
  backgroundColor?: string;
  titleColor?: string;
  backIconColor?: string;
}
export const Header = {
  setNavigation: (
    navigation: NavigationType,
    title: string | undefined,
    renderRight?: Function | undefined,
    renderLeft?: Function | undefined,
    headerTextContainer?: StyleProp<ViewStyle> | undefined,
    options?: HeaderNavigationOptions,
    showDrawerIcon?: boolean,
  ) => {
    const backgroundColor = colors.primary_dark_blue;
    const titleColor = colors.white;
    const backIconColor = titleColor;
    // const backgroundColor = options?.backgroundColor ?? colors.primary_dark_blue;
    // const titleColor = options?.titleColor ?? colors.primary;
    // const backIconColor = options?.backIconColor ?? titleColor;
    navigation.setOptions({
      headerTitle: () =>
        title ? (
          <View style={[styles.headerTextView, headerTextContainer]}>
            <Text
              numberOfLines={1}
              style={[styles.titleText, { color: titleColor }]}
            >
              {title}
            </Text>
          </View>
        ) : (
          <View />
        ),
      headerRight: () => (renderRight ? renderRight() : undefined),
      headerLeft: () =>
        renderLeft ? (
          renderLeft()
        ) : showDrawerIcon ? (
          <TouchableOpacity
            hitSlop={styles.backBttnHitSlop}
            onPress={() => {
              navigation.dispatch(DrawerActions.openDrawer());
            }}
          >
            <Icon name="menu" size={24} color={backIconColor} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            hitSlop={styles.backBttnHitSlop}
            onPress={() => navigation.BackButtonPress()}
          >
            <ImageAtom
              source={images.arrow_back}
              style={[styles.backButton, { tintColor: backIconColor }]}
            />
          </TouchableOpacity>
        ),
      headerStyle: {
        backgroundColor,
      },
      headerTitleAlign: 'center',
      headerTintColor: backgroundColor,
      headerBackVisible: false,
      headerShown: true,
      headerShadowVisible: true,
    } as any);
  },
  setDashboardHeader: (navigation: NavigationType, options: any) => {
    const {
      time = new Date(),
      logo = images.logo,
      onNotificationPress,
      headerContainerStyle,
    } = options;

    const { width, height } = require('react-native').Dimensions.get('window');
    const isTablet = width >= 768;
    const isLandscape = width > height;

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const now = time;
    const day = dayNames[now.getDay()];
    const date = now.getDate();
    const month = monthNames[now.getMonth()];

    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;

    navigation.setOptions({
      headerTitle: () => (
        <View
          style={[
            styles.dashboardMiddleContainer,
            headerContainerStyle,
            {
              maxWidth: isTablet ? 500 : '100%',
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.dashboardDateText,
              {
                fontSize: isTablet ? (isLandscape ? 18 : 16) : 14,
              },
            ]}
          >
            {`${day} ${date} ${month}`}
          </Text>

          <Text
            style={[
              styles.dashboardTimeText,
              {
                fontSize: isTablet ? (isLandscape ? 16 : 14) : 12,
              },
            ]}
          >
            {formattedTime}
          </Text>
        </View>
      ),

      headerLeft: () => (
        <View style={styles.leftContainer}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.drawerToggle}
          >
            <Icon name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
          <ImageAtom
            source={logo}
            style={[
              styles.dashboardLogo,
              {
                width: isTablet ? 40 : 32,
                height: isTablet ? 40 : 32,
              },
            ]}
          />
        </View>
      ),

      headerRight: () => (
        <View style={styles.rightContainer}>
          <TouchableOpacity onPress={() => onNotificationPress?.()}>
            <ImageAtom
              source={images.notification}
              style={[
                styles.notifyIcon,
                {
                  width: isTablet ? 26 : 22,
                  height: isTablet ? 26 : 22,
                },
              ]}
            />
          </TouchableOpacity>
        </View>
      ),

      headerStyle: {
        backgroundColor: colors.grey_5,
        height: isTablet ? (isLandscape ? 90 : 70) : vh(80), // 🔥 main fix
      },

      headerTitleAlign: 'center',
      headerBackVisible: false,
      headerShown: true,
    } as any);
  },
};

const styles = StyleSheet.create({
  titleText: {
    textAlign: 'center',
    fontSize: vw(18),
    color: colors.primary,
    fontFamily: fonts.Roboto_Medium,
    letterSpacing: vw(0.3),
  },
  backButton: {
    width: vw(24),
    height: vw(24),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTextView: {
    width: vw(250),
  },
  backBttnHitSlop: {
    left: vw(25),
    right: vw(25),
    bottom: vw(25),
    top: vw(25),
  },
  dashboardLogo: {
    width: vw(32),
    height: vw(32),
    resizeMode: 'contain',
  },
  dashboardMiddleContainer: {
    alignItems: 'center',
  },
  leftContainer: {
    paddingLeft: vw(15),
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerToggle: {
    marginRight: vw(10),
    padding: vw(4),
  },
  rightContainer: {
    paddingRight: vw(15),
  },

  dashboardDateText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Medium,
    color: colors.primary,
  },

  dashboardTimeText: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: colors.grey_6,
    marginTop: vw(2),
  },

  notifyIcon: {
    width: vw(22),
    height: vw(22),
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
});
