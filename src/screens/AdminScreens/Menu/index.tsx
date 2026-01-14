import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { colors, images, screensName, vh, vw } from '../../../constants';
import {
  Header,
  NavigationType,
} from '../../../components/organisms/HeaderOrganism';
import TextAtom from '../../../components/atoms/TextAtom';
import { useAppSelector } from '../../../hooks';

interface Props {
  navigation: NavigationType;
}

interface MenuItem {
  id: number;
  name: string;
  onPress?: () => void;
  isComingSoon?: boolean;
}

const ACTIVE_MODULES = new Set<string>([
  'Learning Management System',
  'Hostel Management',
  'User Management',
  'Feedback Management',
  'Communication Management System',
  'Report',
  'Support',
  'Invoice and Bill Management',
  'PHC Management System',
  // 'Vehicle Management',
]);

const Menu = ({ navigation }: Props) => {
  const [time, setTime] = useState(new Date());

  const { crediantialData } = useAppSelector(state => state.Auth);
  const userType: string | undefined = crediantialData?.user?.[0]?.userType;

  const isAccountController = userType === 'ACCOUNTCONTROLLER';
  const canSeeInvoice =
    userType === 'SUPERADMIN' || userType === 'ACCOUNTCONTROLLER';

  useLayoutEffect(() => {
    Header.setDashboardHeader(navigation, {
      time,
      logo: images.logo,
      onNotificationPress: () => {},
    });
  }, [time, navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const ALL_MODULES: MenuItem[] = [
    {
      id: 2,
      name: 'Learning Management System',
      onPress: () => navigation.navigate(screensName.LMS),
    },
    {
      id: 3,
      name: 'Hostel Management',
      onPress: () => navigation.navigate(screensName.HostelManagement),
    },
    {
      id: 4,
      name: 'User Management',
      onPress: () => navigation.navigate(screensName.UserManagement),
    },

    {
      id: 5,
      name: 'Feedback Management',
      onPress: () => navigation.navigate(screensName.FeedbackManagement),
    },
    {
      id: 6,
      name: 'Communication Management System',
      onPress: () =>
        navigation.navigate(screensName.CommunicationManagementSystem),
    },
    {
      id: 7,
      name: 'Report',
      onPress: () => navigation.navigate(screensName.Report),
    },
    {
      id: 11,
      name: 'Support',
      onPress: () => navigation.navigate(screensName.SupportMain),
    },
    {
      id: 12,
      name: 'Invoice and Bill Management',
      onPress: () => navigation.navigate(screensName.InvoiceAndBillManagement),
    },
    {
      id: 15,
      name: 'PHC Management System',
      onPress: () => navigation.navigate(screensName.PHCManagement),
    },

    // {
    //   id: 17,
    //   name: 'Vehicle Management',
    //   onPress: () => navigation.navigate(screensName.VehicleManagement),
    // },
    { id: 1, name: 'Content Management System' },

    // { id: 6, name: 'Communication Management System' },

    { id: 8, name: 'HRMS' },
    { id: 9, name: 'Visitor Management System' },
    { id: 10, name: 'Conference Management System' },

    { id: 13, name: 'House Keeping Management' },
    { id: 14, name: 'Budget Management' },

    { id: 16, name: 'Course Report Management' },

    { id: 18, name: 'Mess Management' },
  ];

  const DATA: MenuItem[] = ALL_MODULES.map(item => ({
    ...item,
    isComingSoon: !ACTIVE_MODULES.has(item.name),
  })).filter(item => {
    if (isAccountController) {
      return item.name === 'Invoice and Bill Management';
    }
    if (!canSeeInvoice && item.name === 'Invoice and Bill Management') {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {DATA.map(item => {
          const isDisabled = item.isComingSoon;
          return (
            <TouchableOpacity
              key={item.id.toString()}
              style={[styles.touchable, isDisabled && styles.comingSoonCard]}
              activeOpacity={isDisabled ? 1 : 0.7}
              onPress={isDisabled ? undefined : item.onPress}
            >
              <TextAtom
                style={[styles.menuText, isDisabled && styles.comingSoonText]}
              >
                {item.name}
              </TextAtom>
              {isDisabled && (
                <View style={styles.badge}>
                  <TextAtom style={styles.badgeText}>Coming Soon</TextAtom>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  touchable: {
    width: vw(328),
    height: vh(55),
    borderRadius: vw(6),
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vh(15),
  },
  scrollContent: {
    paddingBottom: vh(30),
  },
  menuText: { color: colors.white, fontSize: vw(16) },
  comingSoonCard: {
    backgroundColor: colors.backgroundColor,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.primary,
    height: vh(55),
    width: vw(328),
  },
  comingSoonText: { color: colors.black },
  badge: {
    position: 'absolute',
    top: vh(6),
    right: vw(10),
    backgroundColor: '#FF9800',
    paddingHorizontal: vw(8),
    paddingVertical: vh(2),
    borderRadius: vw(4),
  },
  badgeText: {
    color: colors.white,
    fontSize: vw(8),
  },
});
