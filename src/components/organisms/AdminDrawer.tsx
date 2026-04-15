import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { colors, fonts, vw, vh, images, screensName } from '../../constants';
import { useAppSelector } from '../../hooks';
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
      { name: 'Trainee Attendance', screen: screensName.TraineeManagement }, // Placeholder
      { name: 'Gate Access', screen: screensName.TraineeManagement }, // Placeholder
    ],
  },
  {
    id: 'hostel',
    name: 'Hostel Management',
    icon: 'bed',
    screen: screensName.HostelManagement,
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

const AdminDrawer = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const [openAccordion, setOpenAccordion] = useState<string | null>('lms');
  const [searchQuery, setSearchQuery] = useState('');

  const { crediantialData } = useAppSelector(state => state.Auth);
  const user = crediantialData?.user?.[0];

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* User Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={
            images.user_profile || { uri: 'https://via.placeholder.com/100' }
          }
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.userName || 'User Name'}</Text>
          <Text style={styles.trainingId}>
            Training ID: {user?.trainingId || 'BIP/GAYA/2026/001'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.closeDrawer()}
          style={styles.closeButton}
        >
          <Icon name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Dashboard Header */}
      <View style={styles.dashboardHeader}>
        <View style={styles.dashboardTitleRow}>
          <Icon
            name="view-grid"
            size={24}
            color={colors.primary}
            style={styles.dashboardIcon}
          />
          <Text style={styles.dashboardTitle}>Dashboard</Text>
        </View>
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
                      {item.subItems?.map((sub, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.subMenuItem}
                          onPress={() => navigation.navigate(sub.screen)}
                        >
                          <View style={styles.subMenuItemLeft}>
                            <View style={styles.bullet} />
                            <Text style={styles.subMenuItemText}>
                              {sub.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.singleMenuItem}
                  onPress={() =>
                    item.screen && navigation.navigate(item.screen)
                  }
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
    paddingTop: vh(40),
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
    top: vh(45),
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
  subMenuItemText: {
    fontSize: vw(14),
    fontFamily: fonts.Roboto_Regular,
    color: colors.text_grey || '#4B5563',
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
