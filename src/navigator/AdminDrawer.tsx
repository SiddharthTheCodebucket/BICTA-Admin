import React, { useState, useEffect } from 'react';
import { DrawerActions } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { colors, fonts, vw, vh, images, screensName } from '../constants';
import { useAppSelector } from '../hooks';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SubMenuItem {
  name: string;
  screen: string;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  screen?: string;
  subItems?: SubMenuItem[];
}

const ADMIN_DASHBOARD_TABS = 'DashboardTabs';

const DASHBOARD_STACK_ROUTES = new Set([
  screensName.Dashboard,
  screensName.HostelPlanningDetails,
  screensName.HostelDetailsDashbaord,
  screensName.BlockDetails,
  screensName.BlockedForm,
]);

const PROFILE_STACK_ROUTES = new Set([
  screensName.Profile,
  screensName.ScanQRAndFace,
  screensName.DeviceRegistration,
  screensName.DeviceList,
]);

const TRAINEE_MANAGEMENT_ROUTE_GROUP = new Set([
  screensName.TraineeManagement,
  screensName.TraineeRegistration,
  screensName.TraineeRegistrationDetails,
  screensName.AddTraineeRegistration,
  screensName.TraineeDetails,
  screensName.TraineeFullDetails,
  screensName.IndemnityBond,
  screensName.TraineeRelease,
  screensName.TraineeReleaseDetails,
  screensName.TraineeReleaseForm,
  screensName.OthersRegistration,
  'TrainingCategoryTab',
  'TrainingDetailsTab',
  'BatchDetailsTab',
]);

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'lms',
    name: 'Learning Management',
    icon: 'book-open-variant',
    subItems: [
      { name: 'Training', screen: screensName.TrainingManagement },
      { name: 'Trainee', screen: screensName.TraineeManagement },
      { name: 'Faculty', screen: screensName.FacultyManagement },
      {
        name: 'Curriculum/Knowledge',
        screen: screensName.CurriculumManagemnet,
      },
      { name: 'Class Location', screen: screensName.ClassLocationManagement },
      { name: 'Class Room', screen: screensName.ClassRoomManagement },
      { name: 'Assignment', screen: screensName.Assignment },
      { name: 'Examination', screen: screensName.Examination },
      { name: 'Trainee Attendance', screen: screensName.TraineeAttendance },
      { name: 'Gate Access', screen: screensName.GateAccess },
    ],
  },
  {
    id: 'hostel',
    name: 'Hostel Management',
    icon: 'bed',
    subItems: [
      { name: 'Hostel', screen: screensName.Hostel },
      { name: 'Guest', screen: screensName.Guest },
    ],
  },
  {
    id: 'user',
    name: 'User Management',
    icon: 'account-cog',
    screen: screensName.UserManagement,
  },
  {
    id: 'feedback',
    name: 'Feedback Management',
    icon: 'comment-text',
    screen: screensName.FeedbackManagement,
  },
  {
    id: 'comm',
    name: 'Communication Management',
    icon: 'chat-processing',
    screen: screensName.CommunicationManagementSystem,
  },
  {
    id: 'report',
    name: 'Report',
    icon: 'file-chart',
    screen: screensName.Report,
  },
  {
    id: 'hrms',
    name: 'HRMS',
    icon: 'account-group',
    screen: screensName.HRMS,
  },
  {
    id: 'visitor',
    name: 'Visitor Management',
    icon: 'account-search',
    screen: screensName.VisitorManagementSystem,
  },
];

const getActiveRouteNames = (state: any): string[] => {
  if (!state?.routes?.length) {
    return [screensName.Dashboard];
  }

  const route = state.routes[state.index ?? 0];
  const routeName = route?.name;

  if (route?.state) {
    return routeName
      ? [routeName, ...getActiveRouteNames(route.state)]
      : getActiveRouteNames(route.state);
  }

  return routeName ? [routeName] : [screensName.Dashboard];
};

const AdminDrawer = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const activeRouteNames = getActiveRouteNames(props.state);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getActiveSubItemScreen = () => {
    if (activeRouteNames.includes(screensName.TraineeAttendance)) {
      return screensName.TraineeAttendance;
    }

    if (activeRouteNames.includes(screensName.GateAccess)) {
      return screensName.GateAccess;
    }

    if (
      activeRouteNames.some(routeName =>
        TRAINEE_MANAGEMENT_ROUTE_GROUP.has(routeName),
      )
    ) {
      return screensName.TraineeManagement;
    }

    return (
      activeRouteNames.find(routeName =>
        MENU_ITEMS.some(
          item =>
            item.screen === routeName ||
            item.subItems?.some(sub => sub.screen === routeName),
        ),
      ) ?? screensName.Menu
    );
  };

  const activeSubItemScreen = getActiveSubItemScreen();

  useEffect(() => {
    const activeMenuItem = MENU_ITEMS.find(
      item =>
        item.screen === activeSubItemScreen ||
        item.subItems?.some(sub => sub.screen === activeSubItemScreen),
    );
    if (activeMenuItem && activeMenuItem.subItems) {
      setOpenAccordion(activeMenuItem.id);
    }
  }, [activeSubItemScreen]);

  const { crediantialData } = useAppSelector(state => state.Auth);
  const user = crediantialData?.user?.[0];

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const closeDrawer = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const openDashboardHome = () => {
    (navigation as any).navigate(ADMIN_DASHBOARD_TABS, {
      screen: screensName.Dashboard,
    });
    closeDrawer();
  };

  const navigateToScreen = (screen: string) => {
    if (DASHBOARD_STACK_ROUTES.has(screen)) {
      (navigation as any).navigate(ADMIN_DASHBOARD_TABS, {
        screen: screensName.Dashboard,
        params: screen === screensName.Dashboard ? undefined : { screen },
      });
      closeDrawer();
      return;
    }

    if (PROFILE_STACK_ROUTES.has(screen)) {
      (navigation as any).navigate(ADMIN_DASHBOARD_TABS, {
        screen: screensName.Profile,
        params: screen === screensName.Profile ? undefined : { screen },
      });
      closeDrawer();
      return;
    }

    (navigation as any).navigate(screen);
    closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* User Profile Header */}
      <View
        style={[
          styles.profileHeader,
          { paddingTop: Math.max(insets.top, vh(16)) + vh(12) },
        ]}
      >
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.userName || 'User Name'}</Text>
          <Text style={styles.trainingId}>
            Training ID: {user?.trainingId || 'BIP/GAYA/2026/001'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={closeDrawer}
          style={[styles.closeButton, { top: Math.max(insets.top, vh(16)) }]}
        >
          <Icon name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Dashboard Header */}
      <View style={styles.dashboardHeader}>
        <TouchableOpacity
          style={styles.dashboardTitleRow}
          onPress={openDashboardHome}
          activeOpacity={0.8}
        >
          <Icon
            name="view-grid"
            size={24}
            color={colors.primary}
            style={styles.dashboardIcon}
          />
          <Text style={styles.dashboardTitle}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchIconContainer}>
          <Icon name="magnify" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.menuScrollView}
        showsVerticalScrollIndicator={false}
      >
        {MENU_ITEMS.map(item => {
          const isOpen = openAccordion === item.id;
          const hasSubItems = item.subItems && item.subItems.length > 0;

          return (
            <View key={item.id} style={styles.menuItemContainer}>
              {hasSubItems ? (
                <View style={styles.accordionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.accordionHeader,
                      isOpen && styles.accordionHeaderActive,
                    ]}
                    onPress={() => toggleAccordion(item.id)}
                  >
                    <View style={styles.headerLeft}>
                      <Icon
                        name={item.icon}
                        size={20}
                        color={isOpen ? colors.white : colors.primary}
                      />
                      <Text
                        style={[
                          styles.menuText,
                          isOpen && styles.menuTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </View>
                    <Icon
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={isOpen ? colors.white : colors.primary}
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.subMenuItemContainer}>
                      {item.subItems?.map((sub, index) => {
                        const isSubActive = activeSubItemScreen === sub.screen;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.subMenuItem,
                              isSubActive && styles.subMenuItemActive,
                            ]}
                            onPress={() => navigateToScreen(sub.screen)}
                          >
                            <View style={styles.subMenuItemLeft}>
                              <View
                                style={[
                                  styles.bullet,
                                  isSubActive && styles.bulletActive,
                                ]}
                              />
                              <Text
                                style={[
                                  styles.subMenuItemText,
                                  isSubActive && styles.subMenuItemTextActive,
                                ]}
                              >
                                {sub.name}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.singleMenuItem}
                  onPress={() => item.screen && navigateToScreen(item.screen)}
                >
                  <View style={styles.menuItemLeft}>
                    <Icon name={item.icon} size={20} color={colors.primary} />
                    <Text style={styles.menuText}>{item.name}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerVersion}>Version 2.0.0.1</Text>
        <Text style={styles.footerDeveloped}>
          Developed by Codebucket Solutions
        </Text>
      </View>
    </View>
  );
};

export default AdminDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  profileHeader: {
    backgroundColor: colors.primary,
    padding: vw(16),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: vw(48),
    height: vw(48),
    borderRadius: vw(24),
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    marginLeft: vw(12),
    flex: 1,
  },
  userName: {
    color: colors.white,
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
  },
  trainingId: {
    color: colors.white,
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    opacity: 0.8,
  },
  closeButton: {
    position: 'absolute',
    right: vw(16),
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: vw(16),
    marginTop: vh(20),
  },
  dashboardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardIcon: {
    marginRight: vw(8),
  },
  dashboardTitle: {
    fontSize: vw(18),
    fontFamily: fonts.Roboto_Bold,
    color: colors.primary,
  },
  searchIconContainer: {
    padding: vw(4),
  },
  menuScrollView: {
    flex: 1,
    paddingHorizontal: vw(16),
  },
  menuItemContainer: {
    marginBottom: vh(10),
  },
  accordionContainer: {
    borderRadius: vw(8),
    overflow: 'hidden',
    backgroundColor: '#FFFBEB', // Very light yellow bg for sub-menu area
    borderWidth: 1,
    borderColor: '#F3E5AB',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: vw(12),
    backgroundColor: colors.white,
    borderRadius: vw(8),
  },
  accordionHeaderActive: {
    backgroundColor: '#B8860B', // Golden color from image
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: vw(15),
    fontFamily: fonts.Roboto_Regular,
    color: colors.primary,
    marginLeft: vw(8),
  },
  menuTextActive: {
    color: colors.white,
    fontFamily: fonts.Roboto_Bold,
  },
  subMenuItemContainer: {
    paddingBottom: vh(10),
    paddingTop: vh(5),
  },
  subMenuItem: {
    paddingVertical: vh(12),
    paddingHorizontal: vw(24),
    borderBottomWidth: 1,
    borderBottomColor: '#F3E5AB',
  },
  subMenuItemActive: {
    backgroundColor: colors.primary_sky_blue,
  },
  subMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: vw(4),
    height: vw(4),
    borderRadius: vw(2),
    backgroundColor: colors.primary,
    marginRight: vw(8),
  },
  bulletActive: {
    backgroundColor: colors.primary_dark_blue,
  },
  subMenuItemText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.text_grey || '#4B5563',
  },
  subMenuItemTextActive: {
    color: colors.primary_dark_blue,
    fontFamily: fonts.Roboto_Bold,
  },
  singleMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: vw(12),
    backgroundColor: colors.white,
    borderRadius: vw(8),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    padding: vw(16),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    backgroundColor: colors.white,
    paddingBottom: vh(30),
  },
  footerVersion: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: colors.text_light_grey || '#666666',
    marginBottom: vh(5),
  },
  footerDeveloped: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: colors.text_light_grey || '#666666',
  },
});
