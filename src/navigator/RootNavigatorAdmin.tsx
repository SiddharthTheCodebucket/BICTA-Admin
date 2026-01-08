import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { screensName } from '../constants';
import DropDownModal from '../modal/DropDownModal';
import AlertOrganism from '../components/organisms/AlertOrganism';
import ErrorModal from '../components/organisms/ErrorModal';
import BottomTabNavigatorAdmin from './BottomTabNavigatorAdmin';
import VehicleManagement from '../screens/AdminScreens/Menu/VehicleManagement';
import VehicleRegistration from '../screens/AdminScreens/Menu/VehicleManagement/VehicleRegistration';
import AddVehicle from '../screens/AdminScreens/Menu/VehicleManagement/VehicleRegistration/AddVehicle';
import AssignVehicle from '../screens/AdminScreens/Menu/VehicleManagement/AssignVehicle';
import DriverMovementHistory from '../screens/AdminScreens/Menu/VehicleManagement/AssignVehicle/DriverMovementHistory';
import AddAssignVehicle from '../screens/AdminScreens/Menu/VehicleManagement/AssignVehicle/AddAssignVehicle';
import CreateTour from '../screens/AdminScreens/Menu/VehicleManagement/CreateTour';
import CreateTourDetails from '../screens/AdminScreens/Menu/VehicleManagement/CreateTour/CreateTourDetails';
import AddCreateTour from '../screens/AdminScreens/Menu/VehicleManagement/CreateTour/AddCreateTour';
import HostelManagement from '../screens/AdminScreens/Menu/HostelManagement';
import Guest from '../screens/AdminScreens/Menu/HostelManagement/Guest';
import AddGuest from '../screens/AdminScreens/Menu/HostelManagement/Guest/AddGuest';
import Hostel from '../screens/AdminScreens/Menu/HostelManagement/Hostel';
import HostelDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelDetails';
import AddHostelDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelDetails/AddHostelDetails';
import FloorDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/FloorDetails';
import AddFloorDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/FloorDetails/AddFloorDetails';
import RoomDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/RoomDetails';
import AddRoomDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/RoomDetails/AddRoomDetails';
import BedDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/BedDetails';
import AddBedDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/BedDetails/AddBedDetails';
import BedAvailability from '../screens/AdminScreens/Menu/HostelManagement/Hostel/BedAvailability';
import HostelAllocationHistory from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelAllocationHistory';
import TrainneHostelAllocationDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelAllocationHistory/TrainneHostelAllocationDetails';
import HostelAllocation from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelAllocation';
import HostelAllocationDetails from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelAllocation/HostelAllocationDetails';
import EditTraineeHostelAllocation from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelAllocation/EditTraineeHostelAllocation';
import EditGuestHostelallocation from '../screens/AdminScreens/Menu/HostelManagement/Hostel/HostelAllocation/EditGuestHostelallocation';
import HostelPlanningDetails from '../screens/AdminScreens/Dashboard/Hostel/HostelPlanningDetails';
import HostelDetailsDashbaord from '../screens/AdminScreens/Dashboard/Hostel/HostelDetailsDashbaord';
import BlockDetails from '../screens/AdminScreens/Dashboard/Hostel/BlockDetails';
import BlockedForm from '../screens/AdminScreens/Dashboard/Hostel/BlockedForm';
import LMS from '../screens/AdminScreens/Menu/LMS';
import TrainingManagement from '../screens/AdminScreens/Menu/LMS/TrainingManagement';
import TrainingCategoryMaster from '../screens/AdminScreens/Menu/LMS/TrainingManagement/TrainingCategoryMaster';
import AddTrainingCategory from '../screens/AdminScreens/Menu/LMS/TrainingManagement/TrainingCategoryMaster/AddTrainingCategory';
import TrainingDetails from '../screens/AdminScreens/Menu/LMS/TrainingManagement/TrainingDetails';
import TrainingDetailsScreen from '../screens/AdminScreens/Menu/LMS/TrainingManagement/TrainingDetails/TrainingDetailsScreen';
import AddTrainingDetails from '../screens/AdminScreens/Menu/LMS/TrainingManagement/TrainingDetails/AddTrainingDetails';
import BatchDetails from '../screens/AdminScreens/Menu/LMS/TrainingManagement/BatchDetails';
import BatchDetailsList from '../screens/AdminScreens/Menu/LMS/TrainingManagement/BatchDetails/BatchDetailsList';
import EditBatchDetails from '../screens/AdminScreens/Menu/LMS/TrainingManagement/BatchDetails/EditBatchDetails';
import MergedBatchForm from '../screens/AdminScreens/Menu/LMS/TrainingManagement/BatchDetails/MergedBatchForm';
import TraineeManagement from '../screens/AdminScreens/Menu/LMS/TraineeManagement';
import TraineeRegistration from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeRegistration';
import TraineeRegistrationDetails from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeRegistration/TraineeRegistrationDetails';
import AddTraineeRegistration from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeRegistration/AddTraineeRegistration';
import TraineeDetails from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeDetails';
import TraineeFullDetails from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeDetails/TraineeFullDetails';
import IndemnityBond from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeDetails/IndemnityBond';
import TraineeRelease from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeRelease';
import TraineeReleaseDetails from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeRelease/TraineeReleaseDetails';
import TraineeReleaseForm from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeRelease/TraineeReleaseForm';
import OthersRegistration from '../screens/AdminScreens/Menu/LMS/TraineeManagement/OthersRegistration';
import FacultyManagement from '../screens/AdminScreens/Menu/LMS/FacultyManagement';
import FacultyDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyDetails';
import FacultyDetailDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyDetails/FacultyDetailDetails';
import FacultyConfirmation from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyConfirmation';
import FacultyConfirmationDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyConfirmation/FacultyConfirmationDetails';
import FacultyClassReportFeedback from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback';
import FacultySubjectFeedbackDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback/FacultySubjectFeedbackDetails';
import FacultyTopicFeedbackDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback/FacultyTopicFeedbackDetails';
import TopicFeedbackCountDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyClassReportFeedback/TopicFeedbackCountDetails';
import AddFacultyDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyDetails/AddFacultyDetails';
import CurriculumManagemnet from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet';
import Subject from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet/Subject';
import SubjectTopic from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet/SubjectTopic';
import ClassLocationManagement from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement';
import LocationDetails from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement/LocationDetails';
import LocationDetailDetails from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement/LocationDetails/LocationDetailDetails';
import SubLocationDetails from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement/SubLocationDetails';
import LocationSubDetailDetails from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement/SubLocationDetails/LocationSubDetailDetails';
import ClassRoomManagement from '../screens/AdminScreens/Menu/LMS/ClassRoomManagement';
import TimeTable from '../screens/AdminScreens/Menu/LMS/ClassRoomManagement/TimeTable';
import FacultyClassApprove from '../screens/AdminScreens/Menu/LMS/ClassRoomManagement/FacultyClassApprove';
import FacultyClassApproveDetails from '../screens/AdminScreens/Menu/LMS/ClassRoomManagement/FacultyClassApprove/FacultyClassApproveDetails';
import Assignment from '../screens/AdminScreens/Menu/LMS/Assignment';
import Question from '../screens/AdminScreens/Menu/LMS/Assignment/Question';
import QuestionBankDetails from '../screens/AdminScreens/Menu/LMS/Assignment/Question/QuestionBankDetails';
import AssignQuestion from '../screens/AdminScreens/Menu/LMS/Assignment/AssignQuestion';
import AssignmentsDetails from '../screens/AdminScreens/Menu/LMS/Assignment/AssignmentsDetails';
import AssignmentDetailsList from '../screens/AdminScreens/Menu/LMS/Assignment/AssignmentsDetails/AssignmentDetailsList';
import AssignmentResponse from '../screens/AdminScreens/Menu/LMS/Assignment/AssignmentResponse';
import AssignmentRessponseDetails from '../screens/AdminScreens/Menu/LMS/Assignment/AssignmentResponse/AssignmentRessponseDetails';
import AssessmentDetails from '../screens/AdminScreens/Menu/LMS/Assignment/AssignmentsDetails/AssessmentDetails';
import Examination from '../screens/AdminScreens/Menu/LMS/Examination';
import CreateTest from '../screens/AdminScreens/Menu/LMS/Examination/CreateTest';
import TestDetailsList from '../screens/AdminScreens/Menu/LMS/Examination/CreateTest/TestDetailsList';
import AssignQuestionList from '../screens/AdminScreens/Menu/LMS/Examination/AssignQuestion';
import ExaminationQuestionBank from '../screens/AdminScreens/Menu/LMS/Examination/ExaminationQuestionBank';
import ExaminationQuestionBankDetails from '../screens/AdminScreens/Menu/LMS/Examination/ExaminationQuestionBank/ExaminationQuestionBankDetails';
import ExamResponse from '../screens/AdminScreens/Menu/LMS/Examination/ExamResponse';
import TraineeResponseList from '../screens/AdminScreens/Menu/LMS/Examination/ExamResponse/TraineeResponseList';
import ExamResponseDetailsListTrainee from '../screens/AdminScreens/Menu/LMS/Examination/ExamResponse/ExamResponseDetailsListTrainee';
import ExamResponseSheet from '../screens/AdminScreens/Menu/LMS/Examination/ExamResponse/ExamResponseSheet';
import PHCManagement from '../screens/AdminScreens/Menu/PHCManagement';
import PHCManagemnetMain from '../screens/AdminScreens/Menu/PHCManagement/PHCManagemnetMain';
import Pharmacy from '../screens/AdminScreens/Menu/PHCManagement/Pharmacy';
import TraineeBMI from '../screens/AdminScreens/Menu/PHCManagement/TraineeBMI';
import Patients from '../screens/AdminScreens/Menu/PHCManagement/Pharmacy/Patients';
import PatientDetails from '../screens/AdminScreens/Menu/PHCManagement/Pharmacy/Patients/PatientDetails';
import PharmacyMaster from '../screens/AdminScreens/Menu/PHCManagement/Pharmacy/PharmacyMaster';
import MedicineType from '../screens/AdminScreens/Menu/PHCManagement/Pharmacy/MedicineType';
import UpdateStock from '../screens/AdminScreens/Menu/PHCManagement/Pharmacy/UpdateStock';
import StockReport from '../screens/AdminScreens/Menu/PHCManagement/Pharmacy/StockReport';
import BMI from '../screens/AdminScreens/Menu/PHCManagement/TraineeBMI/BMI';
import BMIDetails from '../screens/AdminScreens/Menu/PHCManagement/TraineeBMI/BMI/BMIDetails';
import BasicPatientDetails from '../screens/AdminScreens/Menu/PHCManagement/PHCManagemnetMain/BasicPatientDetails';
import PatientDetailDetails from '../screens/AdminScreens/Menu/PHCManagement/PHCManagemnetMain/BasicPatientDetails/PatientDetailDetails';
import InvoiceAndBillManagement from '../screens/AdminScreens/Menu/InvoiceAndBillManagement';
import InvoiceDetails from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails';
import InvoiceAndBillingWorkflow from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails/InvoiceAndBillingWorkflow';
import InvoiceDetailDetails from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails/InvoiceAndBillingWorkflow/InvoiceDetailDetails';
import Movement from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails/InvoiceAndBillingWorkflow/Movement';
import AssignBillForm from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails/InvoiceAndBillingWorkflow/AssignBillForm';
import PaymentDetails from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails/InvoiceAndBillingWorkflow/PaymentDetails';
import PaymentDetailDetails from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails/InvoiceAndBillingWorkflow/PaymentDetailDetails';
import AddPaymentDetails from '../screens/AdminScreens/Menu/InvoiceAndBillManagement/InvoiceDetails/InvoiceAndBillingWorkflow/AddPaymentDetails';
import UserManagement from '../screens/AdminScreens/Menu/UserManagement';
import User from '../screens/AdminScreens/Menu/UserManagement/User';
import UserRegistration from '../screens/AdminScreens/Menu/UserManagement/User/UserRegistration';
import UserRegistrationDetails from '../screens/AdminScreens/Menu/UserManagement/User/UserRegistration/UserRegistrationDetails';
import RoleManagement from '../screens/AdminScreens/Menu/UserManagement/User/RoleManagement';
import AddRole from '../screens/AdminScreens/Menu/UserManagement/User/RoleManagement/AddRole';
import PermissionNameList from '../screens/AdminScreens/Menu/UserManagement/User/PermissionNameList';
import RolePermission from '../screens/AdminScreens/Menu/UserManagement/User/RolePermission';
import RoleWithPermission from '../screens/AdminScreens/Menu/UserManagement/User/RoleWithPermission';
import RoleWithPermissionDetails from '../screens/AdminScreens/Menu/UserManagement/User/RoleWithPermission/RoleWithPermissionDetails';
import SupportMain from '../screens/AdminScreens/Menu/SupportMain';
import SupportAdmin from '../screens/AdminScreens/Menu/SupportMain/SupportAdmin';
import SupportTicketHistory from '../screens/AdminScreens/Menu/SupportMain/SupportAdmin/SupportTicketHistory';
import SupportTicketHistoryDetails from '../screens/AdminScreens/Menu/SupportMain/SupportAdmin/SupportTicketHistory/SupportTicketHistoryDetails';
import SupportTicketResponseDetails from '../screens/AdminScreens/Menu/SupportMain/SupportAdmin/SupportTicketHistory/SupportTicketResponseDetails';
import SupportTicketMovementDetails from '../screens/AdminScreens/Menu/SupportMain/SupportAdmin/SupportTicketHistory/SupportTicketMovementDetails';
import SupportTicketHistoryReply from '../screens/AdminScreens/Menu/SupportMain/SupportAdmin/SupportTicketHistory/SupportTicketHistoryReply';
import AddUserRegistration from '../screens/AdminScreens/Menu/UserManagement/User/UserRegistration/AddUserRegistration';
import FeedbackManagement from '../screens/AdminScreens/Menu/FeedbackManagement';
import Feedback from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback';
import FeedbackCategory from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback/FeedbackCategory';
import AddFeedbackCategory from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback/FeedbackCategory/AddFeedbackCategory';

const DropDownModalScreen = (props: any) => <DropDownModal {...props} />;
const ErrorModalScreen = (props: any) => <ErrorModal {...props} />;

const RootNavigatorAdmin = () => {
  const RootStackScreen = createNativeStackNavigator();
  return (
    <RootStackScreen.Navigator>
      <RootStackScreen.Group
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerShadowVisible: false,
        }}
      >
        <RootStackScreen.Screen
          name="BottomTabNavigatorAdmin"
          component={BottomTabNavigatorAdmin}
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
        <RootStackScreen.Screen name="FloorDetails" component={FloorDetails} />
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
        <RootStackScreen.Screen name="BlockDetails" component={BlockDetails} />
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
        <RootStackScreen.Screen name="BatchDetails" component={BatchDetails} />
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
        <RootStackScreen.Screen name="SubjectTopic" component={SubjectTopic} />
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
        <RootStackScreen.Screen name="Assignment" component={Assignment} />
        <RootStackScreen.Screen name="Question" component={Question} />
        <RootStackScreen.Screen
          name="QuestionBankDetails"
          component={QuestionBankDetails}
        />
        <RootStackScreen.Screen
          name="AssignQuestion"
          component={AssignQuestion}
        />
        <RootStackScreen.Screen
          name="AssignmentsDetails"
          component={AssignmentsDetails}
        />
        <RootStackScreen.Screen
          name="AssignmentDetailsList"
          component={AssignmentDetailsList}
        />
        <RootStackScreen.Screen
          name="AssignmentResponse"
          component={AssignmentResponse}
        />
        <RootStackScreen.Screen
          name="AssignmentRessponseDetails"
          component={AssignmentRessponseDetails}
        />
        <RootStackScreen.Screen
          name="AssessmentDetails"
          component={AssessmentDetails}
        />
        <RootStackScreen.Screen name="Examination" component={Examination} />
        <RootStackScreen.Screen name="CreateTest" component={CreateTest} />
        <RootStackScreen.Screen
          name="TestDetailsList"
          component={TestDetailsList}
        />
        <RootStackScreen.Screen
          name="AssignQuestionList"
          component={AssignQuestionList}
        />
        <RootStackScreen.Screen
          name="ExaminationQuestionBank"
          component={ExaminationQuestionBank}
        />
        <RootStackScreen.Screen
          name="ExaminationQuestionBankDetails"
          component={ExaminationQuestionBankDetails}
        />
        <RootStackScreen.Screen name="ExamResponse" component={ExamResponse} />
        <RootStackScreen.Screen
          name="TraineeResponseList"
          component={TraineeResponseList}
        />
        <RootStackScreen.Screen
          name="ExamResponseDetailsListTrainee"
          component={ExamResponseDetailsListTrainee}
        />
        <RootStackScreen.Screen
          name="ExamResponseSheet"
          component={ExamResponseSheet}
        />
        <RootStackScreen.Screen
          name="PHCManagement"
          component={PHCManagement}
        />
        <RootStackScreen.Screen
          name="PHCManagemnetMain"
          component={PHCManagemnetMain}
        />
        <RootStackScreen.Screen name="Pharmacy" component={Pharmacy} />
        <RootStackScreen.Screen name="TraineeBMI" component={TraineeBMI} />
        <RootStackScreen.Screen name="Patients" component={Patients} />
        <RootStackScreen.Screen
          name="PatientDetails"
          component={PatientDetails}
        />
        <RootStackScreen.Screen
          name="PharmacyMaster"
          component={PharmacyMaster}
        />
        <RootStackScreen.Screen name="MedicineType" component={MedicineType} />
        <RootStackScreen.Screen name="UpdateStock" component={UpdateStock} />
        <RootStackScreen.Screen name="StockReport" component={StockReport} />
        <RootStackScreen.Screen name="BMI" component={BMI} />
        <RootStackScreen.Screen name="BMIDetails" component={BMIDetails} />
        <RootStackScreen.Screen
          name="BasicPatientDetails"
          component={BasicPatientDetails}
        />
        <RootStackScreen.Screen
          name="PatientDetailDetails"
          component={PatientDetailDetails}
        />
        <RootStackScreen.Screen
          name="InvoiceAndBillManagement"
          component={InvoiceAndBillManagement}
        />
        <RootStackScreen.Screen
          name="InvoiceDetails"
          component={InvoiceDetails}
        />
        <RootStackScreen.Screen
          name="InvoiceAndBillingWorkflow"
          component={InvoiceAndBillingWorkflow}
        />
        <RootStackScreen.Screen
          name="InvoiceDetailDetails"
          component={InvoiceDetailDetails}
        />
        <RootStackScreen.Screen name="Movement" component={Movement} />
        <RootStackScreen.Screen
          name="AssignBillForm"
          component={AssignBillForm}
        />
        <RootStackScreen.Screen
          name="PaymentDetails"
          component={PaymentDetails}
        />
        <RootStackScreen.Screen
          name="PaymentDetailDetails"
          component={PaymentDetailDetails}
        />
        <RootStackScreen.Screen
          name="AddPaymentDetails"
          component={AddPaymentDetails}
        />
        <RootStackScreen.Screen
          name="UserManagement"
          component={UserManagement}
        />
        <RootStackScreen.Screen name="User" component={User} />
        <RootStackScreen.Screen
          name="UserRegistration"
          component={UserRegistration}
        />
        <RootStackScreen.Screen
          name="UserRegistrationDetails"
          component={UserRegistrationDetails}
        />
        <RootStackScreen.Screen
          name="AddUserRegistration"
          component={AddUserRegistration}
        />
        <RootStackScreen.Screen
          name="RoleManagement"
          component={RoleManagement}
        />
        <RootStackScreen.Screen name="AddRole" component={AddRole} />
        <RootStackScreen.Screen
          name="PermissionNameList"
          component={PermissionNameList}
        />
        <RootStackScreen.Screen
          name="RolePermission"
          component={RolePermission}
        />
        <RootStackScreen.Screen
          name="RoleWithPermission"
          component={RoleWithPermission}
        />
        <RootStackScreen.Screen
          name="RoleWithPermissionDetails"
          component={RoleWithPermissionDetails}
        />
        <RootStackScreen.Screen name="SupportMain" component={SupportMain} />
        <RootStackScreen.Screen name="SupportAdmin" component={SupportAdmin} />
        <RootStackScreen.Screen
          name="SupportTicketHistory"
          component={SupportTicketHistory}
        />
        <RootStackScreen.Screen
          name="SupportTicketHistoryDetails"
          component={SupportTicketHistoryDetails}
        />
        <RootStackScreen.Screen
          name="SupportTicketResponseDetails"
          component={SupportTicketResponseDetails}
        />
        <RootStackScreen.Screen
          name="SupportTicketMovementDetails"
          component={SupportTicketMovementDetails}
        />
        <RootStackScreen.Screen
          name="SupportTicketHistoryReply"
          component={SupportTicketHistoryReply}
        />
        <RootStackScreen.Screen
          name="FeedbackManagement"
          component={FeedbackManagement}
        />
        <RootStackScreen.Screen name="Feedback" component={Feedback} />
        <RootStackScreen.Screen
          name="FeedbackCategory"
          component={FeedbackCategory}
        />
        <RootStackScreen.Screen
          name="AddFeedbackCategory"
          component={AddFeedbackCategory}
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
      </RootStackScreen.Group>
    </RootStackScreen.Navigator>
  );
};

export default RootNavigatorAdmin;

const styles = StyleSheet.create({});
