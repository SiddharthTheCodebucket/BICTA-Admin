import {
  Dimensions,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from '@react-navigation/material-top-tabs';
import { colors, fonts, strings, vh, vw } from '../../../../../constants';
import {
  Header,
  NavigationType,
} from '../../../../../components/organisms/HeaderOrganism';
import LocationDetails from './LocationDetails';
import SubLocationDetails from './SubLocationDetails';

interface Props {
  route: any;
  navigation: NavigationType;
}

const TopTabs = createMaterialTopTabNavigator();

const CustomClassLocationTabBar = ({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<{
    [key: string]: { x: number; width: number };
  }>({});
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const activeRoute = state.routes[state.index];
    const layout = tabLayouts[activeRoute.key];

    if (layout && scrollViewRef.current) {
      const offset = layout.x + layout.width / 2 - screenWidth / 2;
      scrollViewRef.current.scrollTo({
        x: offset > 0 ? offset : 0,
        animated: true,
      });
    }
  }, [screenWidth, state.index, state.routes, tabLayouts]);

  const onTabLayout = (key: string) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => ({ ...prev, [key]: { x, width } }));
  };

  return (
    <View style={styles.customTabBarContainer}>
      <ScrollView
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        style={styles.customTabScroll}
        contentContainerStyle={styles.customTabWrap}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onLayout={onTabLayout(route.key)}
              onPress={onPress}
              style={[
                styles.customTabItem,
                isFocused && styles.customTabItemActive,
              ]}
              activeOpacity={0.9}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.customTabText,
                  isFocused && styles.customTabTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const ClassLocationManagement = (props: Props) => {
  const { navigation } = props;

  useLayoutEffect(() => {
    Header.setNavigation(
      navigation,
      strings.lms.locationDetails.classLocationManagementTitle,
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
        tabBar={tabBarProps => <CustomClassLocationTabBar {...tabBarProps} />}
        screenOptions={{
          swipeEnabled: true,
          sceneStyle: {
            backgroundColor: colors.new_ui_screen_bg,
          },
        }}
      >
        <TopTabs.Screen
          name="LocationDetails"
          component={LocationDetails}
          initialParams={{ suppressHeader: true }}
          options={{ tabBarLabel: strings.lms.locationDetails.title }}
        />
        <TopTabs.Screen
          name="SubLocationDetails"
          component={SubLocationDetails}
          initialParams={{ suppressHeader: true }}
          options={{
            tabBarLabel: strings.lms.locationDetails.subLocationDetailsTitle,
          }}
        />
      </TopTabs.Navigator>
    </SafeAreaView>
  );
};

export default ClassLocationManagement;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.new_ui_screen_bg,
  },
  customTabBarContainer: {
    marginHorizontal: vw(8),
    marginTop: vh(8),
    borderRadius: vw(8),
  },
  customTabScroll: {
    maxHeight: vh(42),
  },
  customTabWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: vw(6),
    paddingVertical: vh(2),
  },
  customTabItem: {
    height: vh(34),
    minWidth: vw(150),

    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginRight: vw(6),
    paddingHorizontal: vw(8),
    paddingVertical: vw(8),
    borderRadius: vw(8),
  },
  customTabItemActive: {
    backgroundColor: colors.primary_sky_blue,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary_dark_blue,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    elevation: 2,
  },
  customTabText: {
    fontFamily: fonts.Inter_Medium,
    fontSize: vw(14),
    lineHeight: vw(17),
    color: colors.text_black,
  },
  customTabTextActive: {
    color: colors.text_black,
  },
});
