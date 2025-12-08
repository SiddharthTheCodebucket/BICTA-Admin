import { StyleSheet } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../constants';
import { navigationRef } from './RootNavigation';
import Splash from '../screens/Splash';
import DropDownModal from '../modal/DropDownModal';
import AlertOrganism from '../components/organisms/AlertOrganism';
import ErrorModal from '../components/organisms/ErrorModal';
import Login from '../screens/OnBoarding/Login';
import ForgotPassword from '../screens/OnBoarding/ForgotPassword';
import BottomTabNavigator from './BottomTabNavigator';
import VehicleManagement from '../screens/Menu/VehicleManagement';
import VehicleRegistration from '../screens/Menu/VehicleManagement/VehicleRegistration';
import AddVehicle from '../screens/Menu/VehicleManagement/VehicleRegistration/AddVehicle';
import AssignVehicle from '../screens/Menu/VehicleManagement/AssignVehicle';
import DriverMovementHistory from '../screens/Menu/VehicleManagement/AssignVehicle/DriverMovementHistory';
import AddAssignVehicle from '../screens/Menu/VehicleManagement/AssignVehicle/AddAssignVehicle';
import CreateTour from '../screens/Menu/VehicleManagement/CreateTour';
import CreateTourDetails from '../screens/Menu/VehicleManagement/CreateTour/CreateTourDetails';
import AddCreateTour from '../screens/Menu/VehicleManagement/CreateTour/AddCreateTour';
import HostelManagement from '../screens/Menu/HostelManagement';
import Guest from '../screens/Menu/HostelManagement/Guest';
import AddGuest from '../screens/Menu/HostelManagement/Guest/AddGuest';
import Hostel from '../screens/Menu/HostelManagement/Hostel';
import HostelDetails from '../screens/Menu/HostelManagement/Hostel/HostelDetails';
import AddHostelDetails from '../screens/Menu/HostelManagement/Hostel/HostelDetails/AddHostelDetails';
import FloorDetails from '../screens/Menu/HostelManagement/Hostel/FloorDetails';
import AddFloorDetails from '../screens/Menu/HostelManagement/Hostel/FloorDetails/AddFloorDetails';
import RoomDetails from '../screens/Menu/HostelManagement/Hostel/RoomDetails';
import AddRoomDetails from '../screens/Menu/HostelManagement/Hostel/RoomDetails/AddRoomDetails';
import BedDetails from '../screens/Menu/HostelManagement/Hostel/BedDetails';
import AddBedDetails from '../screens/Menu/HostelManagement/Hostel/BedDetails/AddBedDetails';
import BedAvailability from '../screens/Menu/HostelManagement/Hostel/BedAvailability';
import HostelAllocationHistory from '../screens/Menu/HostelManagement/Hostel/HostelAllocationHistory';
import TrainneHostelAllocationDetails from '../screens/Menu/HostelManagement/Hostel/HostelAllocationHistory/TrainneHostelAllocationDetails';
import HostelAllocation from '../screens/Menu/HostelManagement/Hostel/HostelAllocation';
import HostelAllocationDetails from '../screens/Menu/HostelManagement/Hostel/HostelAllocation/HostelAllocationDetails';
import EditTraineeHostelAllocation from '../screens/Menu/HostelManagement/Hostel/HostelAllocation/EditTraineeHostelAllocation';
import EditGuestHostelallocation from '../screens/Menu/HostelManagement/Hostel/HostelAllocation/EditGuestHostelallocation';
import HostelPlanningDetails from '../screens/Dashboard/Hostel/HostelPlanningDetails';
import HostelDetailsDashbaord from '../screens/Dashboard/Hostel/HostelDetailsDashbaord';
import BlockDetails from '../screens/Dashboard/Hostel/BlockDetails';
import BlockedForm from '../screens/Dashboard/Hostel/BlockedForm';
import LMS from '../screens/Menu/LMS';
import TrainingManagement from '../screens/Menu/LMS/TrainingManagement';
import TrainingCategoryMaster from '../screens/Menu/LMS/TrainingManagement/TrainingCategoryMaster';
import AddTrainingCategory from '../screens/Menu/LMS/TrainingManagement/TrainingCategoryMaster/AddTrainingCategory';
import TrainingDetails from '../screens/Menu/LMS/TrainingManagement/TrainingDetails';
import TrainingDetailsScreen from '../screens/Menu/LMS/TrainingManagement/TrainingDetails/TrainingDetailsScreen';
import AddTrainingDetails from '../screens/Menu/LMS/TrainingManagement/TrainingDetails/AddTrainingDetails';
import BatchDetails from '../screens/Menu/LMS/TrainingManagement/BatchDetails';
import BatchDetailsList from '../screens/Menu/LMS/TrainingManagement/BatchDetails/BatchDetailsList';
import EditBatchDetails from '../screens/Menu/LMS/TrainingManagement/BatchDetails/EditBatchDetails';
import MergedBatchForm from '../screens/Menu/LMS/TrainingManagement/BatchDetails/MergedBatchForm';
import TraineeManagement from '../screens/Menu/LMS/TraineeManagement';
import TraineeRegistration from '../screens/Menu/LMS/TraineeManagement/TraineeRegistration';
import TraineeRegistrationDetails from '../screens/Menu/LMS/TraineeManagement/TraineeRegistration/TraineeRegistrationDetails';
import AddTraineeRegistration from '../screens/Menu/LMS/TraineeManagement/TraineeRegistration/AddTraineeRegistration';
import TraineeDetails from '../screens/Menu/LMS/TraineeManagement/TraineeDetails';
import TraineeFullDetails from '../screens/Menu/LMS/TraineeManagement/TraineeDetails/TraineeFullDetails';
import IndemnityBond from '../screens/Menu/LMS/TraineeManagement/TraineeDetails/IndemnityBond';
import TraineeRelease from '../screens/Menu/LMS/TraineeManagement/TraineeRelease';
import TraineeReleaseDetails from '../screens/Menu/LMS/TraineeManagement/TraineeRelease/TraineeReleaseDetails';
import TraineeReleaseForm from '../screens/Menu/LMS/TraineeManagement/TraineeRelease/TraineeReleaseForm';
import OthersRegistration from '../screens/Menu/LMS/TraineeManagement/OthersRegistration';
import FacultyManagement from '../screens/Menu/LMS/FacultyManagement';
import FacultyDetails from '../screens/Menu/LMS/FacultyManagement/FacultyDetails';
import FacultyDetailDetails from '../screens/Menu/LMS/FacultyManagement/FacultyDetails/FacultyDetailDetails';
import FacultyConfirmation from '../screens/Menu/LMS/FacultyManagement/FacultyConfirmation';
import FacultyConfirmationDetails from '../screens/Menu/LMS/FacultyManagement/FacultyConfirmation/FacultyConfirmationDetails';
import FacultyClassReportFeedback from '../screens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback';
import FacultySubjectFeedbackDetails from '../screens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback/FacultySubjectFeedbackDetails';
import FacultyTopicFeedbackDetails from '../screens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback/FacultyTopicFeedbackDetails';
import TopicFeedbackCountDetails from '../screens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback/TopicFeedbackCountDetails';
import AddFacultyDetails from '../screens/Menu/LMS/FacultyManagement/FacultyDetails/AddFacultyDetails';
import CurriculumManagemnet from '../screens/Menu/LMS/CurriculumManagemnet';
import Subject from '../screens/Menu/LMS/CurriculumManagemnet/Subject';
import SubjectTopic from '../screens/Menu/LMS/CurriculumManagemnet/SubjectTopic';
import ClassLocationManagement from '../screens/Menu/LMS/ClassLocationManagement';
import LocationDetails from '../screens/Menu/LMS/ClassLocationManagement/LocationDetails';
import LocationDetailDetails from '../screens/Menu/LMS/ClassLocationManagement/LocationDetails/LocationDetailDetails';
import SubLocationDetails from '../screens/Menu/LMS/ClassLocationManagement/SubLocationDetails';
import LocationSubDetailDetails from '../screens/Menu/LMS/ClassLocationManagement/SubLocationDetails/LocationSubDetailDetails';
import ClassRoomManagement from '../screens/Menu/LMS/ClassRoomManagement';
import TimeTable from '../screens/Menu/LMS/ClassRoomManagement/TimeTable';
import FacultyClassApprove from '../screens/Menu/LMS/ClassRoomManagement/FacultyClassApprove';
import FacultyClassApproveDetails from '../screens/Menu/LMS/ClassRoomManagement/FacultyClassApprove/FacultyClassApproveDetails';

const OnBoardingStack = createNativeStackNavigator();

const OnBoardingNavigator = () => (
  <OnBoardingStack.Navigator
    screenOptions={{
      animation: 'slide_from_right',
      headerShadowVisible: false,
      headerShown: false,
      gestureEnabled: false,
    }}
  >
    <OnBoardingStack.Screen
      name={screensName.Login}
      component={Login}
      options={{ headerShadowVisible: false }}
    />
    <OnBoardingStack.Screen
      name={screensName.ForgotPassword}
      component={ForgotPassword}
      options={{ headerShadowVisible: false }}
    />
  </OnBoardingStack.Navigator>
);

const RootNavigator = () => {
  const RootStackScreen = createNativeStackNavigator();
  return (
    <NavigationContainer ref={navigationRef}>
      <RootStackScreen.Navigator>
        <RootStackScreen.Group
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            headerShadowVisible: false,
          }}
        >
          <RootStackScreen.Screen name="Splash" component={Splash} />
          <RootStackScreen.Screen
            name="OnBoardingNavigator"
            component={OnBoardingNavigator}
            options={{ headerShadowVisible: false }}
          />
          <RootStackScreen.Screen
            name="BottomTabNavigator"
            component={BottomTabNavigator}
          />
          <RootStackScreen.Screen
            name="VehicleManagement"
            component={VehicleManagement}
          />
          <RootStackScreen.Screen
            name="VehicleRegistration"
            component={VehicleRegistration}
          />
          <RootStackScreen.Screen name="AddVehicle" component={AddVehicle} />
          <RootStackScreen.Screen
            name="AssignVehicle"
            component={AssignVehicle}
          />
          <RootStackScreen.Screen
            name="DriverMovementHistory"
            component={DriverMovementHistory}
          />
          <RootStackScreen.Screen
            name="AddAssignVehicle"
            component={AddAssignVehicle}
          />
          <RootStackScreen.Screen name="CreateTour" component={CreateTour} />
          <RootStackScreen.Screen
            name="CreateTourDetails"
            component={CreateTourDetails}
          />
          <RootStackScreen.Screen
            name="AddCreateTour"
            component={AddCreateTour}
          />
          <RootStackScreen.Screen
            name="HostelManagement"
            component={HostelManagement}
          />
          <RootStackScreen.Screen name="Guest" component={Guest} />
          <RootStackScreen.Screen name="AddGuest" component={AddGuest} />
          <RootStackScreen.Screen name="Hostel" component={Hostel} />
          <RootStackScreen.Screen
            name="HostelDetails"
            component={HostelDetails}
          />
          <RootStackScreen.Screen
            name="AddHostelDetails"
            component={AddHostelDetails}
          />
          <RootStackScreen.Screen
            name="FloorDetails"
            component={FloorDetails}
          />
          <RootStackScreen.Screen
            name="AddFloorDetails"
            component={AddFloorDetails}
          />
          <RootStackScreen.Screen name="RoomDetails" component={RoomDetails} />
          <RootStackScreen.Screen
            name="AddRoomDetails"
            component={AddRoomDetails}
          />
          <RootStackScreen.Screen name="BedDetails" component={BedDetails} />
          <RootStackScreen.Screen
            name="AddBedDetails"
            component={AddBedDetails}
          />
          <RootStackScreen.Screen
            name="BedAvailability"
            component={BedAvailability}
          />
          <RootStackScreen.Screen
            name="HostelAllocationHistory"
            component={HostelAllocationHistory}
          />
          <RootStackScreen.Screen
            name="TrainneHostelAllocationDetails"
            component={TrainneHostelAllocationDetails}
          />
          <RootStackScreen.Screen
            name="HostelAllocation"
            component={HostelAllocation}
          />
          <RootStackScreen.Screen
            name="HostelAllocationDetails"
            component={HostelAllocationDetails}
          />
          <RootStackScreen.Screen
            name="EditTraineeHostelAllocation"
            component={EditTraineeHostelAllocation}
          />
          <RootStackScreen.Screen
            name="EditGuestHostelallocation"
            component={EditGuestHostelallocation}
          />
          <RootStackScreen.Screen
            name="HostelPlanningDetails"
            component={HostelPlanningDetails}
          />
          <RootStackScreen.Screen
            name="HostelDetailsDashbaord"
            component={HostelDetailsDashbaord}
          />
          <RootStackScreen.Screen
            name="BlockDetails"
            component={BlockDetails}
          />
          <RootStackScreen.Screen name="BlockedForm" component={BlockedForm} />
          <RootStackScreen.Screen name="LMS" component={LMS} />
          <RootStackScreen.Screen
            name="TrainingManagement"
            component={TrainingManagement}
          />
          <RootStackScreen.Screen
            name="TrainingCategoryMaster"
            component={TrainingCategoryMaster}
          />
          <RootStackScreen.Screen
            name="AddTrainingCategory"
            component={AddTrainingCategory}
          />
          <RootStackScreen.Screen
            name="TrainingDetails"
            component={TrainingDetails}
          />
          <RootStackScreen.Screen
            name="TrainingDetailsScreen"
            component={TrainingDetailsScreen}
          />
          <RootStackScreen.Screen
            name="AddTrainingDetails"
            component={AddTrainingDetails}
          />
          <RootStackScreen.Screen
            name="BatchDetails"
            component={BatchDetails}
          />
          <RootStackScreen.Screen
            name="BatchDetailsList"
            component={BatchDetailsList}
          />
          <RootStackScreen.Screen
            name="EditBatchDetails"
            component={EditBatchDetails}
          />
          <RootStackScreen.Screen
            name="MergedBatchForm"
            component={MergedBatchForm}
          />
          <RootStackScreen.Screen
            name="TraineeManagement"
            component={TraineeManagement}
          />
          <RootStackScreen.Screen
            name="TraineeRegistration"
            component={TraineeRegistration}
          />
          <RootStackScreen.Screen
            name="TraineeRegistrationDetails"
            component={TraineeRegistrationDetails}
          />
          <RootStackScreen.Screen
            name="AddTraineeRegistration"
            component={AddTraineeRegistration}
          />
          <RootStackScreen.Screen
            name="TraineeDetails"
            component={TraineeDetails}
          />
          <RootStackScreen.Screen
            name="TraineeFullDetails"
            component={TraineeFullDetails}
          />
          <RootStackScreen.Screen
            name="IndemnityBond"
            component={IndemnityBond}
          />
          <RootStackScreen.Screen
            name="TraineeRelease"
            component={TraineeRelease}
          />
          <RootStackScreen.Screen
            name="TraineeReleaseDetails"
            component={TraineeReleaseDetails}
          />
          <RootStackScreen.Screen
            name="TraineeReleaseForm"
            component={TraineeReleaseForm}
          />
          <RootStackScreen.Screen
            name="OthersRegistration"
            component={OthersRegistration}
          />
          <RootStackScreen.Screen
            name="FacultyManagement"
            component={FacultyManagement}
          />
          <RootStackScreen.Screen
            name="FacultyDetails"
            component={FacultyDetails}
          />
          <RootStackScreen.Screen
            name="FacultyDetailDetails"
            component={FacultyDetailDetails}
          />
          <RootStackScreen.Screen
            name="FacultyConfirmation"
            component={FacultyConfirmation}
          />
          <RootStackScreen.Screen
            name="FacultyConfirmationDetails"
            component={FacultyConfirmationDetails}
          />
          <RootStackScreen.Screen
            name="FacultyClassReportFeedback"
            component={FacultyClassReportFeedback}
          />
          <RootStackScreen.Screen
            name="FacultySubjectFeedbackDetails"
            component={FacultySubjectFeedbackDetails}
          />
          <RootStackScreen.Screen
            name="FacultyTopicFeedbackDetails"
            component={FacultyTopicFeedbackDetails}
          />
          <RootStackScreen.Screen
            name="TopicFeedbackCountDetails"
            component={TopicFeedbackCountDetails}
          />
          <RootStackScreen.Screen
            name="AddFacultyDetails"
            component={AddFacultyDetails}
          />
          <RootStackScreen.Screen
            name="CurriculumManagemnet"
            component={CurriculumManagemnet}
          />
          <RootStackScreen.Screen name="Subject" component={Subject} />
          <RootStackScreen.Screen
            name="SubjectTopic"
            component={SubjectTopic}
          />
          <RootStackScreen.Screen
            name="ClassLocationManagement"
            component={ClassLocationManagement}
          />
          <RootStackScreen.Screen
            name="LocationDetails"
            component={LocationDetails}
          />
          <RootStackScreen.Screen
            name="LocationDetailDetails"
            component={LocationDetailDetails}
          />
          <RootStackScreen.Screen
            name="SubLocationDetails"
            component={SubLocationDetails}
          />
          <RootStackScreen.Screen
            name="LocationSubDetailDetails"
            component={LocationSubDetailDetails}
          />
          <RootStackScreen.Screen
            name="ClassRoomManagement"
            component={ClassRoomManagement}
          />
          <RootStackScreen.Screen name="TimeTable" component={TimeTable} />
          <RootStackScreen.Screen
            name="FacultyClassApprove"
            component={FacultyClassApprove}
          />
          <RootStackScreen.Screen
            name="FacultyClassApproveDetails"
            component={FacultyClassApproveDetails}
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
            component={DropDownModal}
            options={{
              animation: 'fade',
              headerShown: false,
              headerShadowVisible: false,
            }}
          />
          <RootStackScreen.Screen
            name={'ErrorModal'}
            component={ErrorModal}
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
        </RootStackScreen.Group>
      </RootStackScreen.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({});
