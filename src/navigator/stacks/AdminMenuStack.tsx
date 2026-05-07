import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../../constants';
import Menu from '../../screens/AdminScreens/Menu';
import VehicleManagement from '../../screens/AdminScreens/Menu/VehicleManagement';
import HostelManagement from '../../screens/AdminScreens/Menu/HostelManagement';
import LMS from '../../screens/AdminScreens/Menu/LMS';
import TrainingManagement from '../../screens/AdminScreens/Dashboard/academics/Training';
import TraineeManagement from '../../screens/AdminScreens/Dashboard/academics/Trainee';
import TraineeAttendance from '../../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeAttendance';
import GateAccess from '../../screens/AdminScreens/Menu/LMS/TraineeManagement/GateAccess';
import FacultyManagement from '../../screens/AdminScreens/Dashboard/academics/Faculty';
import TimeTableManagement from '../../screens/AdminScreens/Dashboard/academics/TimeTable';
import CurriculumManagemnet from '../../screens/AdminScreens/Menu/LMS/CurriculumManagemnet';
import ClassLocationManagement from '../../screens/AdminScreens/Menu/LMS/ClassLocationManagement';
import ClassRoomManagement from '../../screens/AdminScreens/Menu/LMS/ClassRoomManagement';
import Assignment from '../../screens/AdminScreens/Dashboard/academics/Assignments';
import Examination from '../../screens/AdminScreens/Menu/LMS/Examination';
import PHCManagement from '../../screens/AdminScreens/Menu/PHCManagement';
import InvoiceAndBillManagement from '../../screens/AdminScreens/Menu/InvoiceAndBillManagement';
import UserManagement from '../../screens/AdminScreens/Menu/UserManagement';
import SupportMain from '../../screens/AdminScreens/Menu/SupportMain';
import FeedbackManagement from '../../screens/AdminScreens/Menu/FeedbackManagement';
import CommunicationManagementSystem from '../../screens/AdminScreens/Menu/CommunicationManagementSystem';
import Report from '../../screens/AdminScreens/Menu/Report';
import CourseReportManagement from '../../screens/AdminScreens/Menu/CourseReportManagement';
import BudgetManagement from '../../screens/AdminScreens/Menu/BudgetManagement';
import HouseKeepingManagement from '../../screens/AdminScreens/Menu/HouseKeepingManagement';
import MessManagement from '../../screens/AdminScreens/Menu/MessManagement';
import HRMS from '../../screens/AdminScreens/Menu/HRMS';
import VisitorManagementSystem from '../../screens/AdminScreens/Menu/VisitorManagementSystem';
import ConferenceManagementSystem from '../../screens/AdminScreens/Menu/ConferenceManagementSystem';

const Stack = createNativeStackNavigator();

const AdminMenuStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={screensName.Menu} component={Menu} />
      <Stack.Screen
        name={screensName.VehicleManagement}
        component={VehicleManagement}
      />
      <Stack.Screen
        name={screensName.HostelManagement}
        component={HostelManagement}
      />
      <Stack.Screen name={screensName.LMS} component={LMS} />
      <Stack.Screen
        name={screensName.TrainingManagement}
        component={TrainingManagement}
      />
      <Stack.Screen
        name={screensName.TraineeManagement}
        component={TraineeManagement}
      />
      <Stack.Screen
        name={screensName.TraineeAttendance}
        component={TraineeAttendance}
      />
      <Stack.Screen name={screensName.GateAccess} component={GateAccess} />
      <Stack.Screen
        name={screensName.FacultyManagement}
        component={FacultyManagement}
      />
      <Stack.Screen
        name={screensName.TimeTableManagement}
        component={TimeTableManagement}
      />
      <Stack.Screen
        name={screensName.CurriculumManagemnet}
        component={CurriculumManagemnet}
      />
      <Stack.Screen
        name={screensName.ClassLocationManagement}
        component={ClassLocationManagement}
      />
      <Stack.Screen
        name={screensName.ClassRoomManagement}
        component={ClassRoomManagement}
      />
      <Stack.Screen
        name={screensName.AssignmentManagement}
        component={Assignment}
      />
      <Stack.Screen name={screensName.Assignment} component={Assignment} />
      <Stack.Screen name={screensName.Examination} component={Examination} />
      <Stack.Screen
        name={screensName.PHCManagement}
        component={PHCManagement}
      />
      <Stack.Screen
        name={screensName.InvoiceAndBillManagement}
        component={InvoiceAndBillManagement}
      />
      <Stack.Screen
        name={screensName.UserManagement}
        component={UserManagement}
      />
      <Stack.Screen name={screensName.SupportMain} component={SupportMain} />
      <Stack.Screen
        name={screensName.FeedbackManagement}
        component={FeedbackManagement}
      />
      <Stack.Screen
        name={screensName.CommunicationManagementSystem}
        component={CommunicationManagementSystem}
      />
      <Stack.Screen name={screensName.Report} component={Report} />
      <Stack.Screen
        name={screensName.CourseReportManagement}
        component={CourseReportManagement}
      />
      <Stack.Screen
        name={screensName.BudgetManagement}
        component={BudgetManagement}
      />
      <Stack.Screen
        name={screensName.HouseKeepingManagement}
        component={HouseKeepingManagement}
      />
      <Stack.Screen
        name={screensName.MessManagement}
        component={MessManagement}
      />
      <Stack.Screen name={screensName.HRMS} component={HRMS} />
      <Stack.Screen
        name={screensName.VisitorManagementSystem}
        component={VisitorManagementSystem}
      />
      <Stack.Screen
        name={screensName.ConferenceManagementSystem}
        component={ConferenceManagementSystem}
      />
    </Stack.Navigator>
  );
};

export default AdminMenuStack;
