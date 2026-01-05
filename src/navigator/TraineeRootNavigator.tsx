import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../constants';

import DropDownModal from '../modal/DropDownModal';
import AlertOrganism from '../components/organisms/AlertOrganism';
import ErrorModal from '../components/organisms/ErrorModal';

import TraineeBottomTabNavigator from './TraineeBottomTabNavigator';

import MyProfile from '../screens/TraineeScreens/Profile/MyProfile';
import ProfileDetails from '../screens/TraineeScreens/Profile/MyProfile/ProfileDetails';
import DocumentDetails from '../screens/TraineeScreens/Profile/MyProfile/DocumentDetails';
import TimeTable from '../screens/TraineeScreens/Menu/MyCourses/TimeTable';
import EditProfile from '../screens/TraineeScreens/Profile/MyProfile/EditProfile';
import IndemnityBondForm from '../screens/TraineeScreens/Profile/MyProfile/IndemnityBondForm';
import IndemnityBond from '../screens/TraineeScreens/Profile/MyProfile/IndemnityBond';

import MyCourses from '../screens/TraineeScreens/Menu/MyCourses';
import Assignment from '../screens/TraineeScreens/Menu/MyCourses/Assignment';
import CourseModule from '../screens/TraineeScreens/Menu/MyCourses/CourseModule';
import AssignmentDetails from '../screens/TraineeScreens/Menu/MyCourses/Assignment/AssignmentDetails';
import CourseModuleDetails from '../screens/TraineeScreens/Menu/MyCourses/CourseModule/CourseModuleDetails';
import AssignmentEdit from '../screens/TraineeScreens/Menu/MyCourses/Assignment/AssignmentEdit';
import FacultyFeedbackModal from '../screens/TraineeScreens/Menu/MyCourses/TimeTable/FacultyFeedbackModal';

import Examination from '../screens/TraineeScreens/Menu/Examination';
import ExamResponseDetailsList from '../screens/TraineeScreens/Menu/Examination/ExamResponseDetailsList';
import ExamResponseSheet from '../screens/TraineeScreens/Menu/Examination/ExamResponseSheet';

import CommunicationManagement from '../screens/TraineeScreens/Menu/CommunicationManagement';
import ShowCauseNotice from '../screens/TraineeScreens/Menu/CommunicationManagement/ShowCauseNotice';
import Application from '../screens/TraineeScreens/Menu/CommunicationManagement/Application';
import ShowCauseNoticeEdit from '../screens/TraineeScreens/Menu/CommunicationManagement/ShowCauseNotice/ShowCauseNoticeEdit';

import Support from '../screens/TraineeScreens/Menu/Support';
import Hostel from '../screens/TraineeScreens/Menu/Hostel';
import ApplicationDetails from '../screens/TraineeScreens/Menu/CommunicationManagement/Application/ApplicationDetails';
import SupportViewAndReply from '../screens/TraineeScreens/Menu/Support/SupportViewAndReply';
import AddSupport from '../screens/TraineeScreens/Menu/Support/AddSupport';

import Feedback from '../screens/TraineeScreens/Menu/Feedback';
import OverallFeedback from '../screens/TraineeScreens/Menu/Feedback/OverallFeedback';

import ShowCaseNoticeModal from '../modal/ShowCaseNoticeModal';
import AddMessFeedback from '../screens/TraineeScreens/Menu/Feedback/MessFeedback/AddMessFeedback';
import MessFeedback from '../screens/TraineeScreens/Menu/Feedback/MessFeedback';
import HouseKeepingFeedback from '../screens/TraineeScreens/Menu/Feedback/HouseKeepingFeedback';
import AddHousekeepingFeedback from '../screens/TraineeScreens/Menu/Feedback/HouseKeepingFeedback/AddHousekeepingFeedback';

const RootStackScreen = createNativeStackNavigator();

const DropDownModalScreen = (props: any) => <DropDownModal {...props} />;
const ErrorModalScreen = (props: any) => <ErrorModal {...props} />;

const TraineeRootNavigator = () => {
  return (
    <RootStackScreen.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerShadowVisible: false,
      }}
    >
      <RootStackScreen.Group
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerShadowVisible: false,
        }}
      >
        <RootStackScreen.Screen
          name="TraineeBottomTabNavigator"
          component={TraineeBottomTabNavigator}
        />

        <RootStackScreen.Screen name="MyProfile" component={MyProfile} />
        <RootStackScreen.Screen
          name="ProfileDetails"
          component={ProfileDetails}
        />
        <RootStackScreen.Screen
          name="DocumentDetails"
          component={DocumentDetails}
        />
        <RootStackScreen.Screen
          name="IndemnityBondForm"
          component={IndemnityBondForm}
        />
        <RootStackScreen.Screen
          name="IndemnityBond"
          component={IndemnityBond}
        />
        <RootStackScreen.Screen name="EditProfile" component={EditProfile} />

        <RootStackScreen.Screen name="MyCourses" component={MyCourses} />
        <RootStackScreen.Screen name="TimeTable" component={TimeTable} />
        <RootStackScreen.Screen name="Assignment" component={Assignment} />
        <RootStackScreen.Screen name="CourseModule" component={CourseModule} />
        <RootStackScreen.Screen
          name="AssignmentDetails"
          component={AssignmentDetails}
        />
        <RootStackScreen.Screen
          name="CourseModuleDetails"
          component={CourseModuleDetails}
        />
        <RootStackScreen.Screen
          name="AssignmentEdit"
          component={AssignmentEdit}
        />

        <RootStackScreen.Screen name="Examination" component={Examination} />
        <RootStackScreen.Screen
          name="ExamResponseDetailsList"
          component={ExamResponseDetailsList}
        />
        <RootStackScreen.Screen
          name="ExamResponseSheet"
          component={ExamResponseSheet}
        />

        <RootStackScreen.Screen
          name="CommunicationManagement"
          component={CommunicationManagement}
        />
        <RootStackScreen.Screen
          name="ShowCauseNotice"
          component={ShowCauseNotice}
        />
        <RootStackScreen.Screen
          name="ShowCauseNoticeEdit"
          component={ShowCauseNoticeEdit}
        />
        <RootStackScreen.Screen name="Application" component={Application} />
        <RootStackScreen.Screen
          name="ApplicationDetails"
          component={ApplicationDetails}
        />

        <RootStackScreen.Screen name="Support" component={Support} />
        <RootStackScreen.Screen
          name="SupportViewAndReply"
          component={SupportViewAndReply}
        />
        <RootStackScreen.Screen name="AddSupport" component={AddSupport} />

        <RootStackScreen.Screen name="Hostel" component={Hostel} />

        <RootStackScreen.Screen name="Feedback" component={Feedback} />
        <RootStackScreen.Screen
          name="AddMessFeedback"
          component={AddMessFeedback}
        />
        <RootStackScreen.Screen
          name="OverallFeedback"
          component={OverallFeedback}
        />
        <RootStackScreen.Screen name="MessFeedback" component={MessFeedback} />
        <RootStackScreen.Screen
          name="HouseKeepingFeedback"
          component={HouseKeepingFeedback}
        />
        <RootStackScreen.Screen
          name="AddHousekeepingFeedback"
          component={AddHousekeepingFeedback}
        />
      </RootStackScreen.Group>
      <RootStackScreen.Group
        screenOptions={{
          headerShown: false,
          presentation: 'transparentModal',
        }}
      >
        <RootStackScreen.Screen
          name={screensName.DropDownModal}
          component={DropDownModalScreen}
          options={{
            animation: 'fade',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <RootStackScreen.Screen
          name={'ErrorModal'}
          component={ErrorModalScreen}
          options={{
            animation: 'fade',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <RootStackScreen.Screen
          name={screensName.AlertOrganism}
          component={AlertOrganism}
          options={{
            animation: 'fade',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <RootStackScreen.Screen
          name={screensName.FacultyFeedbackModal}
          component={FacultyFeedbackModal}
          options={{
            animation: 'fade',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
        <RootStackScreen.Screen
          name={screensName.ShowCaseNoticeModal}
          component={ShowCaseNoticeModal}
          options={{
            animation: 'fade',
            headerShown: false,
            headerShadowVisible: false,
          }}
        />
      </RootStackScreen.Group>
    </RootStackScreen.Navigator>
  );
};

export default TraineeRootNavigator;

const styles = StyleSheet.create({});
