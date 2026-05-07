import React, { useEffect, useMemo, useState } from 'react';
import { DrawerActions } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { colors, fonts, screensName, vh, vw } from '../constants';
import { useAppSelector } from '../hooks';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface DrawerMenuItem {
  id: string;
  name: string;
  icon?: string;
  screen?: string;
  params?: Record<string, unknown>;
  disabled?: boolean;
  matchRoutes?: string[];
  children?: DrawerMenuItem[];
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

const MASTER_CONFIGURATION_ITEMS: DrawerMenuItem[] = [
  {
    id: 'master-academics',
    name: 'Academics',
    screen: screensName.Academics,
    matchRoutes: [screensName.AddTrainingCategory],
  },
  {
    id: 'master-facilities',
    name: 'Facilities',
    screen: screensName.Facilities,
    matchRoutes: [screensName.AddHostelDetails],
  },
  {
    id: 'master-comms-support',
    name: 'Comms & Support',
    screen: screensName.CommsAndSupport,
    matchRoutes: [
      screensName.AddCommsCategory,
      screensName.AddCommsSubCategory,
      screensName.AddCommsIssueType,
      screensName.AddCommsQuestionField,
    ],
  },
  {
    id: 'master-feedback',
    name: 'Feedback',
    screen: screensName.FeedbackMaster,
    matchRoutes: [
      screensName.FeedbackCategory,
      screensName.AddFeedbackCategory,
      screensName.FeedbackTopic,
      screensName.AddFeedbackTopic,
    ],
  },
  {
    id: 'master-conference',
    name: 'Conference',
    screen: screensName.ConferenceMasterDetails,
    matchRoutes: [screensName.AddConferenceForm],
  },
  {
    id: 'master-visitor',
    name: 'Visitor',
    screen: screensName.QRListDetails,
  },
];

const FINANCES_ITEMS: DrawerMenuItem[] = [
  {
    id: 'fin-faculty-report',
    name: 'Faculty Report',
    screen: screensName.FacultyReportMaster,
  },
  {
    id: 'fin-invoice-billing',
    name: 'Invoice & Billing',
    screen: screensName.InvoiceAndBillManagement,
  },
  {
    id: 'fin-budget',
    name: 'Budget',
    screen: screensName.BudgetManagement,
  },
];

const MAIN_MENU_ITEMS: DrawerMenuItem[] = [
  {
    id: 'master-config',
    name: 'Master & Configuration',
    icon: 'cog-outline',
    children: MASTER_CONFIGURATION_ITEMS,
  },
  {
    id: 'website-contents',
    name: 'Website Contents',
    icon: 'monitor-dashboard',
    disabled: true,
  },
  {
    id: 'academics',
    name: 'Academics',
    icon: 'book-open-page-variant-outline',
    screen: screensName.LMS,
    matchRoutes: [
      screensName.TrainingManagement,
      screensName.TraineeManagement,
      screensName.FacultyManagement,
      screensName.ClassRoomManagement,
      screensName.Assignment,
      screensName.Examination,
      screensName.TimeTable,
      screensName.FacultyClassApprove,
      screensName.Question,
      screensName.AssignQuestion,
      screensName.AssignmentsDetails,
      screensName.AssignmentResponse,
      screensName.CreateTest,
      screensName.AssignQuestionList,
      screensName.ExamResponse,
    ],
  },
  {
    id: 'facilities',
    name: 'Facilities',
    icon: 'bed-outline',
    screen: screensName.HostelManagement,
    matchRoutes: [
      screensName.Hostel,
      screensName.Guest,
      screensName.PHCManagement,
      screensName.MessManagement,
      screensName.HouseKeepingManagement,
      screensName.VehicleManagement,
    ],
  },
  {
    id: 'comms-support',
    name: 'Comms & Support',
    icon: 'help-circle-outline',
    screen: screensName.CommunicationManagementSystem,
    matchRoutes: [screensName.SupportMain],
  },
  {
    id: 'conference',
    name: 'Conference',
    icon: 'account-tie-outline',
    screen: screensName.ConferenceManagementSystem,
  },
  {
    id: 'finances',
    name: 'Finances',
    icon: 'safe-square-outline',
    children: FINANCES_ITEMS,
  },
  {
    id: 'hrms',
    name: 'HRMS',
    icon: 'account-group-outline',
    screen: screensName.HRMS,
  },
  {
    id: 'visitor-management',
    name: 'Visitor Management',
    icon: 'account-arrow-right-outline',
    screen: screensName.VisitorManagementSystem,
  },
  {
    id: 'user-roles',
    name: 'User & Roles',
    icon: 'account-cog-outline',
    screen: screensName.UserManagement,
  },
  {
    id: 'sia',
    name: 'SIA',
    icon: 'clipboard-text-outline',
    disabled: true,
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

const itemMatchesActiveRoute = (
  item: DrawerMenuItem,
  activeRouteNames: string[],
): boolean => {
  const routesToMatch = [
    ...(item.screen ? [item.screen] : []),
    ...(item.matchRoutes ?? []),
  ];

  return routesToMatch.some(routeName => activeRouteNames.includes(routeName));
};

const hasActiveChild = (
  item: DrawerMenuItem,
  activeRouteNames: string[],
): boolean => {
  return (
    item.children?.some(
      child =>
        itemMatchesActiveRoute(child, activeRouteNames) ||
        hasActiveChild(child, activeRouteNames),
    ) ?? false
  );
};

const AdminDrawer = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const insets = useSafeAreaInsets();
  const activeRouteNames = getActiveRouteNames(props.state);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const activeMainItemId = useMemo(() => {
    const activeItem = MAIN_MENU_ITEMS.find(
      item =>
        itemMatchesActiveRoute(item, activeRouteNames) ||
        hasActiveChild(item, activeRouteNames),
    );

    return activeItem?.id ?? null;
  }, [activeRouteNames]);

  const isDashboardActive = activeRouteNames.some(routeName =>
    DASHBOARD_STACK_ROUTES.has(routeName),
  );

  useEffect(() => {
    if (activeMainItemId === 'master-config') {
      setExpandedItemId('master-config');
    }
  }, [activeMainItemId]);

  const { crediantialData } = useAppSelector(state => state.Auth);
  const user = crediantialData?.user?.[0];

  const closeDrawer = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  const navigateToItem = (item: DrawerMenuItem) => {
    if (item.disabled || !item.screen) {
      return;
    }

    if (item.screen === screensName.Dashboard) {
      (navigation as any).navigate(ADMIN_DASHBOARD_TABS, {
        screen: screensName.Dashboard,
        params: item.params,
      });
      closeDrawer();
      return;
    }

    if (DASHBOARD_STACK_ROUTES.has(item.screen)) {
      (navigation as any).navigate(ADMIN_DASHBOARD_TABS, {
        screen: screensName.Dashboard,
        params:
          item.screen === screensName.Dashboard
            ? item.params
            : { screen: item.screen, ...(item.params ?? {}) },
      });
      closeDrawer();
      return;
    }

    if (PROFILE_STACK_ROUTES.has(item.screen)) {
      (navigation as any).navigate(ADMIN_DASHBOARD_TABS, {
        screen: screensName.Profile,
        params:
          item.screen === screensName.Profile
            ? item.params
            : { screen: item.screen, ...(item.params ?? {}) },
      });
      closeDrawer();
      return;
    }

    (navigation as any).navigate(item.screen, item.params);
    closeDrawer();
  };

  const openDashboardHome = () => {
    (navigation as any).navigate(ADMIN_DASHBOARD_TABS, {
      screen: screensName.Dashboard,
    });
    closeDrawer();
  };

  const renderMasterChildren = (items: DrawerMenuItem[]) => {
    return (
      <View style={styles.subMenuContainer}>
        {items.map((item, index) => {
          const isActive = itemMatchesActiveRoute(item, activeRouteNames);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.subMenuItem,
                index === items.length - 1 && styles.subMenuItemLast,
              ]}
              onPress={() => navigateToItem(item)}
              activeOpacity={item.disabled ? 1 : 0.8}
            >
              <View style={styles.subMenuLeft}>
                {isActive ? <View style={styles.subMenuBullet} /> : null}
                <Text
                  style={[
                    styles.subMenuText,
                    isActive && styles.subMenuTextActive,
                    item.disabled && styles.disabledText,
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.userName}>{user?.userName || 'Jenny Diana'}</Text>
          <Text style={styles.trainingId}>
            {user?.designation || 'Sr. Assistant Director'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={closeDrawer}
          style={[styles.closeButton, { top: Math.max(insets.top, vh(16)) }]}
        >
          <Icon name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.dashboardHeader}>
        <TouchableOpacity
          style={styles.dashboardRow}
          onPress={openDashboardHome}
          activeOpacity={0.8}
        >
          <Icon
            name="view-dashboard-outline"
            size={24}
            color={colors.primary_dark_blue}
          />
          <Text
            style={[
              styles.dashboardText,
              isDashboardActive && styles.dashboardTextActive,
            ]}
          >
            Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchButton} activeOpacity={0.8}>
          <Icon name="magnify" size={22} color={colors.primary_dark_blue} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.menuScrollView}
        contentContainerStyle={styles.menuScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MAIN_MENU_ITEMS.map(item => {
          const isExpanded = expandedItemId === item.id;
          const isActive =
            itemMatchesActiveRoute(item, activeRouteNames) ||
            hasActiveChild(item, activeRouteNames);
          const hasChildren = Boolean(item.children?.length);

          return (
            <View key={item.id} style={styles.menuBlock}>
              <TouchableOpacity
                style={[
                  styles.menuRow,
                  hasChildren && isExpanded && styles.menuRowExpanded,
                ]}
                onPress={() => {
                  if (hasChildren) {
                    setExpandedItemId(isExpanded ? null : item.id);
                    return;
                  }
                  navigateToItem(item);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.menuRowLeft}>
                  <Icon
                    name={item.icon || 'circle-outline'}
                    size={20}
                    color={
                      hasChildren && isExpanded
                        ? colors.primary_dark_blue
                        : colors.primary_dark_blue
                    }
                  />
                  <Text
                    style={[
                      styles.menuRowText,
                      isActive && !hasChildren && styles.menuRowTextActive,
                      item.disabled && styles.disabledText,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                <Icon
                  name={
                    hasChildren
                      ? isExpanded
                        ? 'chevron-up'
                        : 'chevron-right'
                      : 'chevron-right'
                  }
                  size={20}
                  color={colors.primary_dark_blue}
                />
              </TouchableOpacity>

              {hasChildren && isExpanded
                ? renderMasterChildren(item.children ?? [])
                : null}
            </View>
          );
        })}
      </ScrollView>

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
    backgroundColor: '#10233E',
    paddingHorizontal: vw(14),
    paddingBottom: vh(14),
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: vw(50),
    height: vw(50),
    borderRadius: vw(25),
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileInfo: {
    marginLeft: vw(12),
    flex: 1,
  },
  userName: {
    color: colors.white,
    fontSize: vw(17),
    fontFamily: fonts.Roboto_Bold,
  },
  trainingId: {
    color: '#D8DFE8',
    fontSize: vw(13),
    fontFamily: fonts.Roboto_Regular,
    marginTop: vh(2),
  },
  closeButton: {
    position: 'absolute',
    right: vw(16),
  },
  dashboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(18),
    paddingVertical: vh(16),
  },
  dashboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dashboardText: {
    marginLeft: vw(10),
    color: colors.primary_dark_blue,
    fontSize: vw(16),
    fontFamily: fonts.Roboto_Bold,
  },
  dashboardTextActive: {
    color: colors.primary_dark_blue,
  },
  searchButton: {
    padding: vw(4),
  },
  menuScrollView: {
    flex: 1,
  },
  menuScrollContent: {
    paddingHorizontal: vw(12),
    paddingBottom: vh(24),
  },
  menuBlock: {
    marginBottom: vh(8),
  },
  menuRow: {
    minHeight: vh(46),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: vw(12),
    borderRadius: vw(8),
    backgroundColor: colors.white,
  },
  menuRowExpanded: {
    backgroundColor: '#D6A62A',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: vw(8),
  },
  menuRowText: {
    marginLeft: vw(10),
    color: colors.primary_dark_blue,
    fontSize: vw(15),
    fontFamily: fonts.Roboto_Regular,
    flexShrink: 1,
  },
  menuRowTextActive: {
    fontFamily: fonts.Roboto_Bold,
  },
  subMenuContainer: {
    backgroundColor: '#FBF1D5',
    borderBottomLeftRadius: vw(12),
    borderBottomRightRadius: vw(12),
    overflow: 'hidden',
  },
  subMenuItem: {
    minHeight: vh(42),
    justifyContent: 'center',
    paddingHorizontal: vw(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E3C780',
  },
  subMenuItemLast: {
    borderBottomWidth: 0,
  },
  subMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subMenuBullet: {
    width: vw(6),
    height: vw(6),
    borderRadius: vw(3),
    backgroundColor: colors.primary_dark_blue,
    marginRight: vw(10),
  },
  subMenuText: {
    color: '#253247',
    fontSize: vw(15),
    fontFamily: fonts.Roboto_Regular,
  },
  subMenuTextActive: {
    fontFamily: fonts.Roboto_Bold,
  },
  disabledText: {
    opacity: 0.65,
  },
  footer: {
    paddingHorizontal: vw(16),
    paddingTop: vh(14),
    paddingBottom: vh(24),
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#D2D6DC',
    marginHorizontal: vw(14),
  },
  footerVersion: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: '#9CA3AF',
    marginBottom: vh(4),
  },
  footerDeveloped: {
    fontSize: vw(12),
    fontFamily: fonts.Roboto_Regular,
    color: '#9CA3AF',
  },
});
