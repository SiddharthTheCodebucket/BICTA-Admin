import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { screensName } from '../constants';
import DropDownModal from '../modal/DropDownModal';
import AlertOrganism from '../components/organisms/AlertOrganism';
import ErrorModal from '../components/organisms/ErrorModal';
import BottomTabNavigatorAdmin from './BottomTabNavigatorAdmin';
import AdminDrawer from './AdminDrawer';
import VehicleManagement from '../screens/AdminScreens/Menu/VehicleManagement';
import VehicleRegistration from '../screens/AdminScreens/Menu/VehicleManagement/VehicleRegistration';
import AddVehicle from '../screens/AdminScreens/Menu/VehicleManagement/VehicleRegistration/AddVehicle';
import AssignVehicle from '../screens/AdminScreens/Menu/VehicleManagement/AssignVehicle';
import DriverMovementHistory from '../screens/AdminScreens/Menu/VehicleManagement/AssignVehicle/DriverMovementHistory';
import AddAssignVehicle from '../screens/AdminScreens/Menu/VehicleManagement/AssignVehicle/AddAssignVehicle';
import CreateTour from '../screens/AdminScreens/Menu/VehicleManagement/CreateTour';
import CreateTourDetails from '../screens/AdminScreens/Menu/VehicleManagement/CreateTour/CreateTourDetails';
import AddCreateTour from '../screens/AdminScreens/Menu/VehicleManagement/CreateTour/AddCreateTour';
import Guest from '../screens/AdminScreens/Dashboard/facilities/Hostel/Guest';
import AddGuest from '../screens/AdminScreens/Dashboard/facilities/Hostel/Guest/AddGuest';
import Hostel from '../screens/AdminScreens/Dashboard/facilities/Hostel';
import HostelDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelDetails';
import AddHostelDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelDetails/AddHostelDetails';
import FloorDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/FloorDetails';
import AddFloorDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/FloorDetails/AddFloorDetails';
import RoomDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/RoomDetails';
import AddRoomDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/RoomDetails/AddRoomDetails';
import BedDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/BedDetails';
import AddBedDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/BedDetails/AddBedDetails';
import BedAvailability from '../screens/AdminScreens/Dashboard/facilities/Hostel/BedAvailability';
import HostelAllocationHistory from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelAllocationHistory';
import TrainneHostelAllocationDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelAllocationHistory/TrainneHostelAllocationDetails';
import HostelAllocation from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelAllocation';
import HostelAllocationDetails from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelAllocation/HostelAllocationDetails';
import EditTraineeHostelAllocation from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelAllocation/EditTraineeHostelAllocation';
import EditGuestHostelallocation from '../screens/AdminScreens/Dashboard/facilities/Hostel/HostelAllocation/EditGuestHostelallocation';
import HostelPlanningDetails from '../screens/AdminScreens/Dashboard/Hostel/HostelPlanningDetails';
import HostelDetailsDashbaord from '../screens/AdminScreens/Dashboard/Hostel/HostelDetailsDashbaord';
import BlockDetails from '../screens/AdminScreens/Dashboard/Hostel/BlockDetails';
import BlockedForm from '../screens/AdminScreens/Dashboard/Hostel/BlockedForm';
import Academics from '../screens/AdminScreens/Dashboard/masterConfiguration/academics';
import Facilities from '../screens/AdminScreens/Dashboard/masterConfiguration/facilities';
import AddMedicineType from '../screens/AdminScreens/Dashboard/masterConfiguration/facilities/Pharmacy/AddMedicineType';
import AddPharmacyMaster from '../screens/AdminScreens/Dashboard/masterConfiguration/facilities/Pharmacy/AddPharmacyMaster';
import AddHouseKeepingTask from '../screens/AdminScreens/Dashboard/masterConfiguration/facilities/HouseKeeping/AddHouseKeepingTask';
import AddMessMaster from '../screens/AdminScreens/Dashboard/masterConfiguration/facilities/Mess/AddMessMaster';
import AddMessTopic from '../screens/AdminScreens/Dashboard/masterConfiguration/facilities/Mess/AddMessTopic';
import AddLibraryMaster from '../screens/AdminScreens/Dashboard/facilities/Library/BookStock/AddLibraryMaster';
import AddCategory from '../screens/AdminScreens/Dashboard/masterConfiguration/commsSupport/AddCategory';
import AddSubCategory from '../screens/AdminScreens/Dashboard/masterConfiguration/commsSupport/AddSubCategory';
import AddIssueType from '../screens/AdminScreens/Dashboard/masterConfiguration/commsSupport/AddIssueType';
import AddQuestionField from '../screens/AdminScreens/Dashboard/masterConfiguration/commsSupport/AddQuestionField';

import FacultyReportMaster from '../screens/AdminScreens/Dashboard/finances/FacultyReportMaster';
import LMS from '../screens/AdminScreens/Menu/LMS';

import TrainingManagement from '../screens/AdminScreens/Dashboard/academics/Training';

import TrainingDetailsScreen from '../screens/AdminScreens/Dashboard/academics/Training/TrainingManagement/TrainingDetails/TrainingDetailsScreen';
import AddTrainingDetails from '../screens/AdminScreens/Dashboard/academics/Training/TrainingManagement/TrainingDetails/AddTrainingDetails';
import BatchDetailsList from '../screens/AdminScreens/Dashboard/academics/Training/TrainingManagement/BatchDetails/BatchDetailsList';
import EditBatchDetails from '../screens/AdminScreens/Dashboard/academics/Training/TrainingManagement/BatchDetails/EditBatchDetails';
import MergedBatchForm from '../screens/AdminScreens/Dashboard/academics/Training/TrainingManagement/BatchDetails/MergedBatchForm';
import TraineeManagement from '../screens/AdminScreens/Dashboard/academics/Trainee';
import TraineeAttendance from '../screens/AdminScreens/Menu/LMS/TraineeManagement/TraineeAttendance';
import GateAccess from '../screens/AdminScreens/Menu/LMS/TraineeManagement/GateAccess';
import TraineeRegistration from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeRegistration';
import TraineeRegistrationDetails from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeRegistration/TraineeRegistrationDetails';
import AddTraineeRegistration from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeRegistration/AddTraineeRegistration';
import TraineeDetails from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeDetails';
import TraineeFullDetails from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeDetails/TraineeFullDetails';
import IndemnityBond from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeDetails/IndemnityBond';
import TraineeRelease from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeRelease';
import TraineeReleaseDetails from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeRelease/TraineeReleaseDetails';
import TraineeReleaseForm from '../screens/AdminScreens/Dashboard/academics/Trainee/TraineeRelease/TraineeReleaseForm';
import OthersRegistration from '../screens/AdminScreens/Dashboard/academics/Trainee/OthersRegistration';
import FacultyManagement from '../screens/AdminScreens/Dashboard/academics/Faculty';
import FacultyDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyDetails';
import FacultyDetailDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyDetails/FacultyDetailDetails';
import FacultyConfirmation from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyConfirmation';
import FacultyConfirmationDetails from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyConfirmation/FacultyConfirmationDetails';
import FacultyClassReportFeedback from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyClassReportFeedback';
import FacultySubjectFeedbackDetails from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyClassReportFeedback/FacultySubjectFeedbackDetails';
import FacultyTopicFeedbackDetails from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyClassReportFeedback/FacultyTopicFeedbackDetails';
import TopicFeedbackCountDetails from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyClassReportFeedback/TopicFeedbackCountDetails';
import AddFacultyDetails from '../screens/AdminScreens/Menu/LMS/FacultyManagement/FacultyDetails/AddFacultyDetails';
import CurriculumManagemnet from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet';
import Subject from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet/Subject';
import AddSubject from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet/Subject/AddSubject';
import SubjectDetails from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet/Subject/SubjectDetails';
import SubjectTopic from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet/SubjectTopic';
import AddSubjectTopic from '../screens/AdminScreens/Menu/LMS/CurriculumManagemnet/SubjectTopic/AddSubjectTopic';
import ClassLocationManagement from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement';
import LocationDetails from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement/LocationDetails';
import LocationDetailDetails from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement/LocationDetails/LocationDetailDetails';
import SubLocationDetails from '../screens/AdminScreens/Dashboard/academics/TimeTable/ClassSubLocation';
import LocationSubDetailDetails from '../screens/AdminScreens/Dashboard/academics/TimeTable/ClassSubLocation/LocationSubDetailDetails';
import AddLocation from '../screens/AdminScreens/Menu/LMS/ClassLocationManagement/LocationDetails/AddLocation';
import AddSubLocation from '../screens/AdminScreens/Dashboard/academics/TimeTable/ClassSubLocation/AddSubLocation';
import ClassRoomManagement from '../screens/AdminScreens/Menu/LMS/ClassRoomManagement';
import TimeTableManagement from '../screens/AdminScreens/Dashboard/academics/TimeTable';
import TimeTable from '../screens/AdminScreens/Dashboard/academics/TimeTable/Timetable';
import FacultyClassApprove from '../screens/AdminScreens/Dashboard/academics/TimeTable/ClassApproval';
import FacultyClassApproveDetails from '../screens/AdminScreens/Dashboard/academics/TimeTable/ClassApproval/FacultyClassApproveDetails';
import Assignment from '../screens/AdminScreens/Dashboard/academics/Assignments';
import Question from '../screens/AdminScreens/Dashboard/academics/Assignments/Question';
import AddQuestion from '../screens/AdminScreens/Dashboard/academics/Assignments/Question/AddQuestion';
import QuestionBankDetails from '../screens/AdminScreens/Dashboard/academics/Assignments/Question/QuestionBankDetails';
import AssignQuestion from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignQuestion';
import EditAssignQuestion from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignQuestion/EditAssignQuestion';
import AssignmentsDetails from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignmentsDetails';
import AssignmentDetailsList from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignmentsDetails/AssignmentDetailsList';
import AssignmentResponse from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignmentResponse';
import AssignmentRessponseDetails from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignmentResponse/AssignmentRessponseDetailsList';
import AssignmentResponseDetails from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignmentResponse/AssignmentResponseDetails';
import AssessmentDetails from '../screens/AdminScreens/Dashboard/academics/Assignments/AssignmentsDetails/AssessmentDetails';
import Examination from '../screens/AdminScreens/Dashboard/academics/Examination';
import CreateTest from '../screens/AdminScreens/Dashboard/academics/Examination/CreateTest';
import TestDetailsList from '../screens/AdminScreens/Dashboard/academics/Examination/CreateTest/TestDetailsList';
import AssignQuestionList from '../screens/AdminScreens/Dashboard/academics/Examination/AssignQuestion';
import ExaminationQuestionBank from '../screens/AdminScreens/Dashboard/academics/Examination/ExaminationQuestionBank';
import ExaminationQuestionBankDetails from '../screens/AdminScreens/Dashboard/academics/Examination/ExaminationQuestionBank/ExaminationQuestionBankDetails';
import ExamResponse from '../screens/AdminScreens/Dashboard/academics/Examination/ExamResponse';
import TraineeResponseList from '../screens/AdminScreens/Dashboard/academics/Examination/ExamResponse/TraineeResponseList';
import ExamResponseDetailsListTrainee from '../screens/AdminScreens/Dashboard/academics/Examination/ExamResponse/ExamResponseDetailsListTrainee';
import ExamResponseSheet from '../screens/AdminScreens/Dashboard/academics/Examination/ExamResponse/ExamResponseSheet';
import HealthCare from '../screens/AdminScreens/Dashboard/facilities/HealthCare';
import PHCManagemnetMain from '../screens/AdminScreens/Dashboard/facilities/HealthCare/PHCManagemnetMain';
import TraineeBMI from '../screens/AdminScreens/Dashboard/facilities/HealthCare/TraineeBMI';
import Pharmacy from '../screens/AdminScreens/Dashboard/facilities/HealthCare/Pharmacy';
import Patients from '../screens/AdminScreens/Dashboard/facilities/HealthCare/Pharmacy/Patients';
import PatientDetails from '../screens/AdminScreens/Dashboard/facilities/HealthCare/Pharmacy/Patients/PatientDetails';

import UpdateStock from '../screens/AdminScreens/Dashboard/facilities/HealthCare/Pharmacy/UpdateStock';
import StockReport from '../screens/AdminScreens/Dashboard/facilities/HealthCare/Pharmacy/StockReport';
import BMI from '../screens/AdminScreens/Dashboard/facilities/HealthCare/TraineeBMI/BMI';
import BMIDetails from '../screens/AdminScreens/Dashboard/facilities/HealthCare/TraineeBMI/BMI/BMIDetails';
import BasicPatientDetails from '../screens/AdminScreens/Dashboard/facilities/HealthCare/PHCManagemnetMain/BasicPatientDetails';
import PatientDetailDetails from '../screens/AdminScreens/Dashboard/facilities/HealthCare/PHCManagemnetMain/BasicPatientDetails/PatientDetailDetails';
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
// import Feedback from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback';
import FeedbackCategory from '../screens/AdminScreens/Dashboard/masterConfiguration/feedback/FeedbackCategory';
import AddFeedbackCategory from '../screens/AdminScreens/Dashboard/masterConfiguration/feedback/FeedbackCategory/AddFeedbackCategory';
import FeedbackTopic from '../screens/AdminScreens/Dashboard/masterConfiguration/feedback/FeedbackTopic';
import AddFeedbackTopic from '../screens/AdminScreens/Dashboard/masterConfiguration/feedback/FeedbackTopic/AddFeedbackTopic';
import OverallFeedback from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback/OverallFeedback';
import FacultyFeedbackByTrainee from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback/FacultyFeedbackByTrainee';
import FacultyFeedbackByTraineeDetails from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback/FacultyFeedbackByTrainee/FacultyFeedbackByTraineeDetails';
import FacultyFeedbackByObserver from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback/FacultyFeedbackByObserver';
import FacultyFeedbackByObserverDetails from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback/FacultyFeedbackByObserver/FacultyFeedbackByObserverDetails';
import MessFeedbackResponse from '../screens/AdminScreens/Dashboard/facilities/Mess/Feedback';
import MessFeedbackResponseDetails from '../screens/AdminScreens/Dashboard/facilities/Mess/Feedback/MessFeedbackResponseDetails';
import HouseKeepingFeedbackResponse from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/Feedback';
import HouseKeepingFeedbackResponseDetails from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/Feedback/HouseKeepingFeedbackResponseDetails';
import FacultyFeedbackTrainingWise from '../screens/AdminScreens/Dashboard/academics/Training/FacultyFeedbackTrainingWise';
import FacultyFeedbackTrainingWiseDetails from '../screens/AdminScreens/Dashboard/academics/Training/FacultyFeedbackTrainingWise/FacultyFeedbackTrainingWiseDetails';
import ClassCountList from '../screens/AdminScreens/Dashboard/academics/Training/FacultyFeedbackTrainingWise/ClassCountList';
import FeedbackCountList from '../screens/AdminScreens/Dashboard/academics/Training/FacultyFeedbackTrainingWise/FeedbackCountList';
import FeedbackGivenByTraineeList from '../screens/AdminScreens/Dashboard/academics/Training/FacultyFeedbackTrainingWise/FeedbackGivenByTraineeList';
import CommunicationManagementSystem from '../screens/AdminScreens/Menu/CommunicationManagementSystem';
import Communication from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication';
import Application from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/Application';
import ApplicationDetails from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/Application/ApplicationDetails';
import ApplicationEdit from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/Application/ApplicationEdit';
import Notice from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/Notice';
import ShowCauseNotification from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/ShowCauseNotification';
import ShowCauseNoticeResponse from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/ShowCauseNotification/ShowCauseNoticeResponse';
import LeaveDetails from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/LeaveDetails';
import LeaveDetailsList from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/LeaveDetails/LeaveDetailsList';
import AddNotice from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/Notice/AddNotice';
import AddShowCauseNotice from '../screens/AdminScreens/Menu/CommunicationManagementSystem/Communication/ShowCauseNotification/AddShowCauseNotice';
import Report from '../screens/AdminScreens/Menu/Report';
import FacultyReport from '../screens/AdminScreens/Menu/Report/FacultyReport';
import CourseWise from '../screens/AdminScreens/Menu/Report/FacultyReport/CourseWise';
import CourseWiseDetails from '../screens/AdminScreens/Menu/Report/FacultyReport/CourseWise/CourseWiseDetails';
import FacultyWiseClassReport from '../screens/AdminScreens/Menu/Report/FacultyReport/FacultyWiseClassReport';
import FacultyWiseClassReportDetails from '../screens/AdminScreens/Menu/Report/FacultyReport/FacultyWiseClassReport/FacultyWiseClassReportDetails';
import FacultyCalculationSheet from '../screens/AdminScreens/Menu/Report/FacultyReport/FacultyCalculationSheet';
import FacultyClassReportTrainingWise from '../screens/AdminScreens/Menu/Report/FacultyReport/FacultyClassReportTrainingWise';
import CourseWiseApprovalStatus from '../screens/AdminScreens/Menu/Report/FacultyReport/CourseWiseApprovalStatus';
import FacultyUpcomingClassReport from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyUpcomingClassReport';
import FacultyUpcomingClassTimeTable from '../screens/AdminScreens/Dashboard/academics/Faculty/FacultyUpcomingClassReport/FacultyUpcomingClassTimeTable';
import CourseReportManagement from '../screens/AdminScreens/Menu/CourseReportManagement';
import CourseReportManagementMain from '../screens/AdminScreens/Menu/CourseReportManagement/CourseReportManagementMain';
import CourseReport from '../screens/AdminScreens/Dashboard/academics/Training/CourseReport';
import BudgetManagement from '../screens/AdminScreens/Menu/BudgetManagement';
import BudgetMangementMain from '../screens/AdminScreens/Menu/BudgetManagement/BudgetMangementMain';
import CreateTraining from '../screens/AdminScreens/Menu/BudgetManagement/BudgetMangementMain/CreateTraining';
import Particulars from '../screens/AdminScreens/Menu/BudgetManagement/BudgetMangementMain/Particulars';
import Budget from '../screens/AdminScreens/Menu/BudgetManagement/BudgetMangementMain/Budget';
import EstimatedBudgetList from '../screens/AdminScreens/Menu/BudgetManagement/BudgetMangementMain/Budget/EstimatedBudgetList';
import AddCreateTraining from '../screens/AdminScreens/Menu/BudgetManagement/BudgetMangementMain/CreateTraining/AddCreateTraining';
import AddParticulars from '../screens/AdminScreens/Menu/BudgetManagement/BudgetMangementMain/Particulars/AddParticulars';
import HouseKeeping from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping';
import HouseKeepingManagementMain from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/HouseKeepingManagementMain';
import TaskMaster from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/HouseKeepingManagementMain/TaskMaster';
import TaskMasterDetails from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/HouseKeepingManagementMain/TaskMaster/TaskMasterDetails';
import AddTaskMaster from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/HouseKeepingManagementMain/TaskMaster/AddTaskMaster';
import TaskDetails from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/HouseKeepingManagementMain/TaskDetails';
import TaskDetailDetails from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/HouseKeepingManagementMain/TaskDetails/TaskDetailDetails';
import TransferTask from '../screens/AdminScreens/Dashboard/facilities/HouseKeeping/HouseKeepingManagementMain/TaskDetails/TransferTask';
import Library from '../screens/AdminScreens/Dashboard/facilities/Library';
import Mess from '../screens/AdminScreens/Dashboard/facilities/Mess';
import MessMaster from '../screens/AdminScreens/Dashboard/facilities/Mess/MessMaster';
import StockDetails from '../screens/AdminScreens/Dashboard/facilities/Mess/StockDetails';
import MessReport from '../screens/AdminScreens/Dashboard/facilities/Mess/MessReport';
import ItemBrand from '../screens/AdminScreens/Dashboard/facilities/Mess/MessMaster/ItemBrand';
import AddItemBrand from '../screens/AdminScreens/Dashboard/facilities/Mess/MessMaster/ItemBrand/AddItemBrand';
import AddItemType from '../screens/AdminScreens/Dashboard/facilities/Mess/MessMaster/ItemType/AddItemType';
import ItemType from '../screens/AdminScreens/Dashboard/facilities/Mess/MessMaster/ItemType';

import AddItem from '../screens/AdminScreens/Dashboard/facilities/Mess/MessMaster/Item/AddItem';
import StockReportMess from '../screens/AdminScreens/Dashboard/facilities/Mess/MessReport/StockReportMess';
import StockReportDetails from '../screens/AdminScreens/Dashboard/facilities/Mess/MessReport/StockReportMess/StockReportDetails';
import Stock from '../screens/AdminScreens/Dashboard/facilities/Mess/StockDetails/Stock';
import AddStock from '../screens/AdminScreens/Dashboard/facilities/Mess/StockDetails/Stock/AddStock';
import StockConsumption from '../screens/AdminScreens/Dashboard/facilities/Mess/StockDetails/StockConsumption';
import AddStockConsumption from '../screens/AdminScreens/Dashboard/facilities/Mess/StockDetails/StockConsumption/AddStockConsumption';
import HRMS from '../screens/AdminScreens/Menu/HRMS';
import VendorEmployeeMangement from '../screens/AdminScreens/Menu/HRMS/VendorEmployeeMangement';
import LeaveManagement from '../screens/AdminScreens/Menu/HRMS/LeaveManagement';
import EmployeeLeaveHistory from '../screens/AdminScreens/Menu/HRMS/LeaveManagement/EmployeeLeaveHistory';
import CreditLeaveBalance from '../screens/AdminScreens/Menu/HRMS/LeaveManagement/EmployeeLeaveHistory/CreditLeaveBalance';
import LeaveHistoryDetails from '../screens/AdminScreens/Menu/HRMS/LeaveManagement/EmployeeLeaveHistory/LeaveHistoryDetails';
import AvailLeave from '../screens/AdminScreens/Menu/HRMS/LeaveManagement/EmployeeLeaveHistory/AvailLeave';
import LeaveApproval from '../screens/AdminScreens/Menu/HRMS/LeaveManagement/LeaveApproval';
import LeaveApprovalDetails from '../screens/AdminScreens/Menu/HRMS/LeaveManagement/LeaveApproval/LeaveApprovalDetails';
import TrackRecords from '../screens/AdminScreens/Menu/HRMS/LeaveManagement/LeaveApproval/TrackRecords';
import VendorListDetails from '../screens/AdminScreens/Menu/HRMS/VendorEmployeeMangement/VendorListDetails';
import Item from '../screens/AdminScreens/Dashboard/facilities/Mess/MessMaster/Item';
import EmployeeDetails from '../screens/AdminScreens/Menu/HRMS/VendorEmployeeMangement/EmployeeDetails';
import EmployeeDetailDetails from '../screens/AdminScreens/Menu/HRMS/VendorEmployeeMangement/EmployeeDetails/EmployeeDetailDetails';
import VisitorManagementSystem from '../screens/AdminScreens/Menu/VisitorManagementSystem';
import VisitorManagement from '../screens/AdminScreens/Menu/VisitorManagementSystem/VisitorManagement';
import QRListDetails from '../screens/AdminScreens/Menu/VisitorManagementSystem/VisitorManagement/QRListDetails';
import VisitorListDetails from '../screens/AdminScreens/Menu/VisitorManagementSystem/VisitorManagement/VisitorListDetails';
import ConferenceManagementSystem from '../screens/AdminScreens/Menu/ConferenceManagementSystem';
import ConferenceManagement from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement';
import ConferenceMasterDetails from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/ConferenceMasterDetails';
import GuestSeniorityList from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/ConferenceMasterDetails/GuestSeniorityList';
import ManagementIncharge from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/ManagementIncharge';
import ManagementInchargeDetails from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/ManagementIncharge/ManagementInchargeDetails';
import ConferenceManthanFeedback from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/ConferenceManthanFeedback';
import FeedbackQuestionsResponse from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/ConferenceManthanFeedback/FeedbackQuestionsResponse';
import GuestDetails from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/GuestDetails';
import GuestDetailDetails from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/GuestDetails/GuestDetailDetails';
import BlockVendorFrom from '../screens/AdminScreens/Menu/HRMS/VendorEmployeeMangement/VendorListDetails/BlockVendorFrom';
import BlockEmployeeFrom from '../screens/AdminScreens/Menu/HRMS/VendorEmployeeMangement/EmployeeDetails/BlockEmployeeFrom';
import AddConferenceForm from '../screens/AdminScreens/Menu/ConferenceManagementSystem/ConferenceManagement/ConferenceMasterDetails/AddConferenceForm';
import ScanQRAndFace from '../screens/AdminScreens/Profile/ScanQRAndFace';
import DeviceRegistration from '../screens/AdminScreens/Profile/FaceScan/DeviceRegistration';
import DeviceList from '../screens/AdminScreens/Profile/FaceScan/DeviceList';
import Feedback from '../screens/AdminScreens/Menu/FeedbackManagement/Feedback';
import { FeedbackMaster } from '../screens/AdminScreens/Dashboard/masterConfiguration/feedback';
import AddTrainingCategoryMaster from '../screens/AdminScreens/Dashboard/masterConfiguration/academics/TrainingCategoryMaster/AddTrainingCategoryMaster';
import AddTraineeDesignation from '../screens/AdminScreens/Dashboard/masterConfiguration/academics/TraineeDesignation/AddTraineeDesignation';
import { CommsAndSupport } from '../screens/AdminScreens/Dashboard/masterConfiguration/commsSupport';

const DropDownModalScreen = (props: any) => <DropDownModal {...props} />;
const ErrorModalScreen = (props: any) => <ErrorModal {...props} />;
const RootStackScreen = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const ADMIN_APP_DRAWER = 'AdminAppDrawer';
const ADMIN_DASHBOARD_TABS = 'DashboardTabs';

const AppDrawer = () => (
  <Drawer.Navigator
    drawerContent={props => <AdminDrawer {...props} />}
    screenOptions={{
      headerShown: false,
    }}
  >
    <Drawer.Screen
      name={ADMIN_DASHBOARD_TABS}
      component={BottomTabNavigatorAdmin}
    />
    <Drawer.Screen name={screensName.Academics} component={Academics} />
    <Drawer.Screen name={screensName.Facilities} component={Facilities} />
    <Drawer.Screen
      name={screensName.CommsAndSupport}
      component={CommsAndSupport}
    />
    <Drawer.Screen
      name={screensName.FeedbackMaster}
      component={FeedbackMaster}
    />
    <Drawer.Screen
      name={screensName.FacultyReportMaster}
      component={FacultyReportMaster}
    />
    <Drawer.Screen name={screensName.LMS} component={LMS} />

    <Drawer.Screen
      name={screensName.TrainingManagement}
      component={TrainingManagement}
    />
    <Drawer.Screen
      name={screensName.TraineeManagement}
      component={TraineeManagement}
    />
    <Drawer.Screen
      name={screensName.FacultyManagement}
      component={FacultyManagement}
    />
    <Drawer.Screen
      name={screensName.TimeTableManagement}
      component={TimeTableManagement}
    />
    <Drawer.Screen
      name={screensName.AssignmentManagement}
      component={Assignment}
    />
    <Drawer.Screen
      name={screensName.ExaminationManagement}
      component={Examination}
    />
    <Drawer.Screen
      name={screensName.CurriculumManagemnet}
      component={CurriculumManagemnet}
    />
    <Drawer.Screen
      name={screensName.ClassLocationManagement}
      component={ClassLocationManagement}
    />
    <Drawer.Screen
      name={screensName.ClassRoomManagement}
      component={ClassRoomManagement}
    />
    <Drawer.Screen name={screensName.Assignment} component={Assignment} />
    <Drawer.Screen name={screensName.Examination} component={Examination} />
    <Drawer.Screen
      name={screensName.TraineeAttendance}
      component={TraineeAttendance}
    />
    <Drawer.Screen name={screensName.GateAccess} component={GateAccess} />
    <Drawer.Screen
      name={screensName.HostelManagement}
      component={Hostel}
    />
    <Drawer.Screen name={screensName.Hostel} component={Hostel} />
    <Drawer.Screen name={screensName.PHCManagement} component={HealthCare} />
    <Drawer.Screen name={screensName.MessManagement} component={Mess} />
    <Drawer.Screen
      name={screensName.HouseKeepingManagement}
      component={HouseKeeping}
    />
    <Drawer.Screen name={screensName.Library} component={Library} />
    <Drawer.Screen
      name={screensName.UserManagement}
      component={UserManagement}
    />
    <Drawer.Screen
      name={screensName.FeedbackManagement}
      component={FeedbackManagement}
    />
    <Drawer.Screen
      name={screensName.CommunicationManagementSystem}
      component={CommunicationManagementSystem}
    />
    <Drawer.Screen name={screensName.Report} component={Report} />
    <Drawer.Screen name={screensName.HRMS} component={HRMS} />
    <Drawer.Screen
      name={screensName.VisitorManagementSystem}
      component={VisitorManagementSystem}
    />
  </Drawer.Navigator>
);

const RootNavigatorAdmin = () => {
  return (
    <RootStackScreen.Navigator>
      <RootStackScreen.Group
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerShadowVisible: false,
        }}
      >
        <RootStackScreen.Screen name={ADMIN_APP_DRAWER} component={AppDrawer} />
        <RootStackScreen.Screen
          name={screensName.AddMedicineType}
          component={AddMedicineType}
        />
        <RootStackScreen.Screen
          name={screensName.AddPharmacyMaster}
          component={AddPharmacyMaster}
        />
        <RootStackScreen.Screen
          name={screensName.AddHouseKeepingTask}
          component={AddHouseKeepingTask}
        />
        <RootStackScreen.Screen
          name={screensName.AddMessMaster}
          component={AddMessMaster}
        />
        <RootStackScreen.Screen
          name={screensName.AddMessTopic}
          component={AddMessTopic}
        />
        <RootStackScreen.Screen
          name={screensName.AddLibraryMaster}
          component={AddLibraryMaster}
        />
        <RootStackScreen.Screen name={screensName.Library} component={Library} />
        <RootStackScreen.Screen
          name={screensName.AddCommsCategory}
          component={AddCategory}
        />
        <RootStackScreen.Screen
          name={screensName.AddCommsSubCategory}
          component={AddSubCategory}
        />
        <RootStackScreen.Screen
          name={screensName.AddCommsIssueType}
          component={AddIssueType}
        />
        <RootStackScreen.Screen
          name={screensName.AddCommsQuestionField}
          component={AddQuestionField}
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
          component={Hostel}
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
        <RootStackScreen.Screen name={screensName.LMS} component={LMS} />
        <RootStackScreen.Screen
          name={screensName.TrainingManagement}
          component={TrainingManagement}
        />
        <RootStackScreen.Screen
          name={screensName.AddTrainingCategoryMaster}
          component={AddTrainingCategoryMaster}
        />
        <RootStackScreen.Screen
          name={screensName.AddTraineeDesignation}
          component={AddTraineeDesignation}
        />
        <RootStackScreen.Screen
          name={screensName.TrainingDetails}
          component={TrainingManagement}
          initialParams={{ initialTab: 'TrainingDetails' }}
        />
        <RootStackScreen.Screen
          name={screensName.TrainingDetailsScreen}
          component={TrainingDetailsScreen}
        />
        <RootStackScreen.Screen
          name={screensName.AddTrainingDetails}
          component={AddTrainingDetails}
        />
        <RootStackScreen.Screen
          name={screensName.BatchDetails}
          component={TrainingManagement}
          initialParams={{ initialTab: 'BatchDetails' }}
        />
        <RootStackScreen.Screen
          name={screensName.BatchDetailsList}
          component={BatchDetailsList}
        />
        <RootStackScreen.Screen
          name={screensName.EditBatchDetails}
          component={EditBatchDetails}
        />
        <RootStackScreen.Screen
          name={screensName.MergedBatchForm}
          component={MergedBatchForm}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeManagement}
          component={TraineeManagement}
        />
        <RootStackScreen.Screen
          name="TraineeAttendance"
          component={TraineeAttendance}
        />
        <RootStackScreen.Screen name="GateAccess" component={GateAccess} />
        <RootStackScreen.Screen
          name={screensName.TraineeRegistration}
          component={TraineeRegistration}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeRegistrationDetails}
          component={TraineeRegistrationDetails}
        />
        <RootStackScreen.Screen
          name={screensName.AddTraineeRegistration}
          component={AddTraineeRegistration}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeDetails}
          component={TraineeDetails}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeFullDetails}
          component={TraineeFullDetails}
        />
        <RootStackScreen.Screen
          name={screensName.IndemnityBond}
          component={IndemnityBond}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeRelease}
          component={TraineeRelease}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeReleaseDetails}
          component={TraineeReleaseDetails}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeReleaseForm}
          component={TraineeReleaseForm}
        />
        <RootStackScreen.Screen
          name={screensName.OthersRegistration}
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
          name="SubjectDetails"
          component={SubjectDetails}
        />
        <RootStackScreen.Screen name="AddSubject" component={AddSubject} />
        <RootStackScreen.Screen name="SubjectTopic" component={SubjectTopic} />
        <RootStackScreen.Screen
          name="AddSubjectTopic"
          component={AddSubjectTopic}
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
          name={screensName.SubLocationDetails}
          component={SubLocationDetails}
        />
        <RootStackScreen.Screen
          name={screensName.LocationSubDetailDetails}
          component={LocationSubDetailDetails}
        />
        <RootStackScreen.Screen
          name={screensName.AddLocation}
          component={AddLocation}
        />
        <RootStackScreen.Screen
          name={screensName.AddSubLocation}
          component={AddSubLocation}
        />
        <RootStackScreen.Screen
          name="ClassRoomManagement"
          component={ClassRoomManagement}
        />
        <RootStackScreen.Screen
          name={screensName.TimeTableManagement}
          component={TimeTableManagement}
        />

        <RootStackScreen.Screen
          name={screensName.TimeTable}
          component={TimeTable}
        />
        <RootStackScreen.Screen
          name={screensName.FacultyClassApprove}
          component={FacultyClassApprove}
        />
        <RootStackScreen.Screen
          name={screensName.FacultyClassApproveDetails}
          component={FacultyClassApproveDetails}
        />
        <RootStackScreen.Screen
          name={screensName.AssignmentManagement}
          component={Assignment}
        />
        <RootStackScreen.Screen
          name={screensName.Assignment}
          component={Assignment}
        />
        <RootStackScreen.Screen
          name={screensName.Question}
          component={Question}
        />
        <RootStackScreen.Screen
          name={screensName.AddQuestion}
          component={AddQuestion}
        />
        <RootStackScreen.Screen
          name={screensName.QuestionBankDetails}
          component={QuestionBankDetails}
        />
        <RootStackScreen.Screen
          name={screensName.AssignQuestion}
          component={AssignQuestion}
        />
        <RootStackScreen.Screen
          name={screensName.EditAssignQuestion}
          component={EditAssignQuestion}
        />
        <RootStackScreen.Screen
          name={screensName.AssignmentsDetails}
          component={AssignmentsDetails}
        />
        <RootStackScreen.Screen
          name={screensName.AssignmentDetailsList}
          component={AssignmentDetailsList}
        />
        <RootStackScreen.Screen
          name={screensName.AssignmentResponse}
          component={AssignmentResponse}
        />
        <RootStackScreen.Screen
          name={screensName.AssignmentRessponseDetails}
          component={AssignmentRessponseDetails}
        />
        <RootStackScreen.Screen
          name={screensName.AssignmentResponseDetails}
          component={AssignmentResponseDetails}
        />
        <RootStackScreen.Screen
          name={screensName.AssessmentDetails}
          component={AssessmentDetails}
        />
        <RootStackScreen.Screen
          name={screensName.ExaminationManagement}
          component={Examination}
        />
        <RootStackScreen.Screen
          name={screensName.Examination}
          component={Examination}
        />
        <RootStackScreen.Screen
          name={screensName.CreateTest}
          component={CreateTest}
        />
        <RootStackScreen.Screen
          name={screensName.TestDetailsList}
          component={TestDetailsList}
        />
        <RootStackScreen.Screen
          name={screensName.AssignQuestionList}
          component={AssignQuestionList}
        />
        <RootStackScreen.Screen
          name={screensName.ExaminationQuestionBank}
          component={ExaminationQuestionBank}
        />
        <RootStackScreen.Screen
          name={screensName.ExaminationQuestionBankDetails}
          component={ExaminationQuestionBankDetails}
        />
        <RootStackScreen.Screen
          name={screensName.ExamResponse}
          component={ExamResponse}
        />
        <RootStackScreen.Screen
          name={screensName.TraineeResponseList}
          component={TraineeResponseList}
        />
        <RootStackScreen.Screen
          name={screensName.ExamResponseDetailsListTrainee}
          component={ExamResponseDetailsListTrainee}
        />
        <RootStackScreen.Screen
          name={screensName.ExamResponseSheet}
          component={ExamResponseSheet}
        />
        <RootStackScreen.Screen
          name="PHCManagement"
          component={HealthCare}
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
        <RootStackScreen.Screen
          name={screensName.Feedback}
          component={Feedback}
        />
        <RootStackScreen.Screen
          name={screensName.FeedbackCategory}
          component={FeedbackCategory}
        />
        <RootStackScreen.Screen
          name={screensName.AddFeedbackCategory}
          component={AddFeedbackCategory}
        />
        <RootStackScreen.Screen
          name={screensName.FeedbackTopic}
          component={FeedbackTopic}
        />
        <RootStackScreen.Screen
          name={screensName.AddFeedbackTopic}
          component={AddFeedbackTopic}
        />
        <RootStackScreen.Screen
          name="OverallFeedback"
          component={OverallFeedback}
        />
        <RootStackScreen.Screen
          name="FacultyFeedbackByTrainee"
          component={FacultyFeedbackByTrainee}
        />
        <RootStackScreen.Screen
          name="FacultyFeedbackByTraineeDetails"
          component={FacultyFeedbackByTraineeDetails}
        />
        <RootStackScreen.Screen
          name="FacultyFeedbackByObserver"
          component={FacultyFeedbackByObserver}
        />
        <RootStackScreen.Screen
          name="FacultyFeedbackByObserverDetails"
          component={FacultyFeedbackByObserverDetails}
        />
        <RootStackScreen.Screen
          name="MessFeedbackResponse"
          component={MessFeedbackResponse}
        />
        <RootStackScreen.Screen
          name="MessFeedbackResponseDetails"
          component={MessFeedbackResponseDetails}
        />
        <RootStackScreen.Screen
          name="HouseKeepingFeedbackResponse"
          component={HouseKeepingFeedbackResponse}
        />
        <RootStackScreen.Screen
          name="HouseKeepingFeedbackResponseDetails"
          component={HouseKeepingFeedbackResponseDetails}
        />
        <RootStackScreen.Screen
          name={screensName.FacultyFeedbackTrainingWise}
          component={FacultyFeedbackTrainingWise}
        />
        <RootStackScreen.Screen
          name={screensName.FacultyFeedbackTrainingWiseDetails}
          component={FacultyFeedbackTrainingWiseDetails}
        />
        <RootStackScreen.Screen
          name={screensName.ClassCountList}
          component={ClassCountList}
        />
        <RootStackScreen.Screen
          name={screensName.FeedbackCountList}
          component={FeedbackCountList}
        />
        <RootStackScreen.Screen
          name={screensName.FeedbackGivenByTraineeList}
          component={FeedbackGivenByTraineeList}
        />
        <RootStackScreen.Screen
          name="CommunicationManagementSystem"
          component={CommunicationManagementSystem}
        />
        <RootStackScreen.Screen
          name="Communication"
          component={Communication}
        />
        <RootStackScreen.Screen name="Application" component={Application} />
        <RootStackScreen.Screen
          name="ApplicationDetails"
          component={ApplicationDetails}
        />
        <RootStackScreen.Screen
          name="ApplicationEdit"
          component={ApplicationEdit}
        />
        <RootStackScreen.Screen name="Notice" component={Notice} />
        <RootStackScreen.Screen
          name="ShowCauseNotification"
          component={ShowCauseNotification}
        />
        <RootStackScreen.Screen
          name="ShowCauseNoticeResponse"
          component={ShowCauseNoticeResponse}
        />
        <RootStackScreen.Screen name="LeaveDetails" component={LeaveDetails} />
        <RootStackScreen.Screen
          name="LeaveDetailsList"
          component={LeaveDetailsList}
        />
        <RootStackScreen.Screen name="AddNotice" component={AddNotice} />
        <RootStackScreen.Screen
          name="AddShowCauseNotice"
          component={AddShowCauseNotice}
        />
        <RootStackScreen.Screen name="Report" component={Report} />
        <RootStackScreen.Screen
          name="FacultyReport"
          component={FacultyReport}
        />
        <RootStackScreen.Screen name="CourseWise" component={CourseWise} />
        <RootStackScreen.Screen
          name="CourseWiseDetails"
          component={CourseWiseDetails}
        />
        <RootStackScreen.Screen
          name="FacultyWiseClassReport"
          component={FacultyWiseClassReport}
        />
        <RootStackScreen.Screen
          name="FacultyWiseClassReportDetails"
          component={FacultyWiseClassReportDetails}
        />
        <RootStackScreen.Screen
          name="FacultyCalculationSheet"
          component={FacultyCalculationSheet}
        />
        <RootStackScreen.Screen
          name="FacultyClassReportTrainingWise"
          component={FacultyClassReportTrainingWise}
        />
        <RootStackScreen.Screen
          name="CourseWiseApprovalStatus"
          component={CourseWiseApprovalStatus}
        />
        <RootStackScreen.Screen
          name="FacultyUpcomingClassReport"
          component={FacultyUpcomingClassReport}
        />
        <RootStackScreen.Screen
          name="FacultyUpcomingClassTimeTable"
          component={FacultyUpcomingClassTimeTable}
        />
        <RootStackScreen.Screen
          name="CourseReportManagement"
          component={CourseReportManagement}
        />
        <RootStackScreen.Screen
          name="CourseReportManagementMain"
          component={CourseReportManagementMain}
        />
        <RootStackScreen.Screen
          name={screensName.CourseReport}
          component={CourseReport}
        />
        <RootStackScreen.Screen
          name="BudgetManagement"
          component={BudgetManagement}
        />
        <RootStackScreen.Screen
          name="BudgetMangementMain"
          component={BudgetMangementMain}
        />
        <RootStackScreen.Screen
          name="CreateTraining"
          component={CreateTraining}
        />
        <RootStackScreen.Screen name="Particulars" component={Particulars} />
        <RootStackScreen.Screen name="Budget" component={Budget} />
        <RootStackScreen.Screen
          name="EstimatedBudgetList"
          component={EstimatedBudgetList}
        />
        <RootStackScreen.Screen
          name="AddCreateTraining"
          component={AddCreateTraining}
        />
        <RootStackScreen.Screen
          name="AddParticulars"
          component={AddParticulars}
        />
        <RootStackScreen.Screen
          name="HouseKeepingManagement"
          component={HouseKeeping}
        />
        <RootStackScreen.Screen
          name="HouseKeepingManagementMain"
          component={HouseKeepingManagementMain}
        />
        <RootStackScreen.Screen name="TaskMaster" component={TaskMaster} />
        <RootStackScreen.Screen
          name="TaskMasterDetails"
          component={TaskMasterDetails}
        />
        <RootStackScreen.Screen
          name="AddTaskMaster"
          component={AddTaskMaster}
        />
        <RootStackScreen.Screen name="TaskDetails" component={TaskDetails} />
        <RootStackScreen.Screen
          name="TaskDetailDetails"
          component={TaskDetailDetails}
        />
        <RootStackScreen.Screen name="TransferTask" component={TransferTask} />
        <RootStackScreen.Screen
          name="MessManagement"
          component={Mess}
        />
        <RootStackScreen.Screen name="MessMaster" component={MessMaster} />
        <RootStackScreen.Screen name="StockDetails" component={StockDetails} />
        <RootStackScreen.Screen name="MessReport" component={MessReport} />
        <RootStackScreen.Screen name="ItemBrand" component={ItemBrand} />
        <RootStackScreen.Screen name="AddItemBrand" component={AddItemBrand} />
        <RootStackScreen.Screen name="ItemType" component={ItemType} />
        <RootStackScreen.Screen name="AddItemType" component={AddItemType} />
        <RootStackScreen.Screen name="Item" component={Item} />
        <RootStackScreen.Screen name="AddItem" component={AddItem} />
        <RootStackScreen.Screen
          name="StockReportMess"
          component={StockReportMess}
        />
        <RootStackScreen.Screen
          name="StockReportDetails"
          component={StockReportDetails}
        />
        <RootStackScreen.Screen name="Stock" component={Stock} />
        <RootStackScreen.Screen name="AddStock" component={AddStock} />
        <RootStackScreen.Screen
          name="StockConsumption"
          component={StockConsumption}
        />
        <RootStackScreen.Screen
          name="AddStockConsumption"
          component={AddStockConsumption}
        />
        <RootStackScreen.Screen name="HRMS" component={HRMS} />
        <RootStackScreen.Screen
          name="VendorEmployeeMangement"
          component={VendorEmployeeMangement}
        />
        <RootStackScreen.Screen
          name="LeaveManagement"
          component={LeaveManagement}
        />
        <RootStackScreen.Screen
          name="EmployeeLeaveHistory"
          component={EmployeeLeaveHistory}
        />
        <RootStackScreen.Screen
          name="CreditLeaveBalance"
          component={CreditLeaveBalance}
        />
        <RootStackScreen.Screen
          name="LeaveHistoryDetails"
          component={LeaveHistoryDetails}
        />
        <RootStackScreen.Screen name="AvailLeave" component={AvailLeave} />
        <RootStackScreen.Screen
          name="LeaveApproval"
          component={LeaveApproval}
        />
        <RootStackScreen.Screen
          name="LeaveApprovalDetails"
          component={LeaveApprovalDetails}
        />
        <RootStackScreen.Screen name="TrackRecords" component={TrackRecords} />
        <RootStackScreen.Screen
          name="VendorListDetails"
          component={VendorListDetails}
        />
        <RootStackScreen.Screen
          name="EmployeeDetails"
          component={EmployeeDetails}
        />
        <RootStackScreen.Screen
          name="EmployeeDetailDetails"
          component={EmployeeDetailDetails}
        />
        <RootStackScreen.Screen
          name="VisitorManagementSystem"
          component={VisitorManagementSystem}
        />
        <RootStackScreen.Screen
          name="VisitorManagement"
          component={VisitorManagement}
        />
        <RootStackScreen.Screen
          name="QRListDetails"
          component={QRListDetails}
        />
        <RootStackScreen.Screen
          name="VisitorListDetails"
          component={VisitorListDetails}
        />
        <RootStackScreen.Screen
          name="ConferenceManagementSystem"
          component={ConferenceManagementSystem}
        />
        <RootStackScreen.Screen
          name="ConferenceManagement"
          component={ConferenceManagement}
        />
        <RootStackScreen.Screen
          name="ConferenceMasterDetails"
          component={ConferenceMasterDetails}
        />
        <RootStackScreen.Screen
          name="GuestSeniorityList"
          component={GuestSeniorityList}
        />
        <RootStackScreen.Screen
          name="ManagementIncharge"
          component={ManagementIncharge}
        />
        <RootStackScreen.Screen
          name="ManagementInchargeDetails"
          component={ManagementInchargeDetails}
        />
        <RootStackScreen.Screen
          name="ConferenceManthanFeedback"
          component={ConferenceManthanFeedback}
        />
        <RootStackScreen.Screen
          name="FeedbackQuestionsResponse"
          component={FeedbackQuestionsResponse}
        />
        <RootStackScreen.Screen name="GuestDetails" component={GuestDetails} />
        <RootStackScreen.Screen
          name="GuestDetailDetails"
          component={GuestDetailDetails}
        />
        <RootStackScreen.Screen
          name="BlockVendorFrom"
          component={BlockVendorFrom}
        />
        <RootStackScreen.Screen
          name="BlockEmployeeFrom"
          component={BlockEmployeeFrom}
        />
        <RootStackScreen.Screen
          name="AddConferenceForm"
          component={AddConferenceForm}
        />
        <RootStackScreen.Screen
          name="ScanQRAndFace"
          component={ScanQRAndFace}
        />
        <RootStackScreen.Screen
          name={screensName.DeviceRegistration}
          component={DeviceRegistration}
        />
        <RootStackScreen.Screen
          name={screensName.DeviceList}
          component={DeviceList}
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
