import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export interface TrainingManagementStateType {
  bipardLocation: { [key: string]: any };
  trainingCategoryList: { [key: string]: any };
  trainingCategory: { [key: string]: any };
  budgetList: { [key: string]: any };
  trainingList: { [key: string]: any };
  training: { [key: string]: any };
  budget: { [key: string]: any };
  trainingFullName: string;
  trainingShortName: string;
  trainingStartDate: string;
  trainingEndDate: string;
  trainingType: { [key: string]: any };
  trainingFee: { [key: string]: any };
  natureOfCourse: { [key: string]: any };
  noOfParticipants: string;
  parentDepartmentList: { [key: string]: any };
  parentDepartment: { [key: string]: any };
  noOfSectionAndBatches: string;
  status: { [key: string]: any };
  courseThumbnail: { [key: string]: any };
  courseDesc: '';
  hostelList: { [key: string]: any };
  hostel: { [key: string]: any };
  courseCoordinatorList: { [key: string]: any };
  courseCoordinator: { [key: string]: any };
  youngProfessionalList: { [key: string]: any };
  youngProfessional: { [key: string]: any };
  courseLocationList: { [key: string]: any };
  courseLocation: { [key: string]: any };
  courseSubLocationList: { [key: string]: any };
  courseSubLocation: { [key: string]: any };
  courseLetter: { [key: string]: any };
  trainingTeamLocations: { [key: string]: any };
}
export const initialState: TrainingManagementStateType = {
  bipardLocation: {},
  trainingCategoryList: [],
  trainingCategory: {},
  budget: {},
  budgetList: {},
  trainingList: {},
  training: {},
  trainingFullName: '',
  trainingShortName: '',
  trainingStartDate: '',
  trainingEndDate: '',
  trainingType: {},
  trainingFee: {},
  natureOfCourse: {},
  noOfParticipants: '',
  parentDepartmentList: [],
  parentDepartment: {},
  noOfSectionAndBatches: '',
  status: {},
  courseThumbnail: {},
  courseDesc: '',
  hostelList: [],
  hostel: {},
  courseCoordinatorList: [],
  courseCoordinator: {},
  youngProfessionalList: [],
  youngProfessional: {},
  courseLocationList: [],
  courseLocation: {},
  courseSubLocationList: [],
  courseSubLocation: {},
  courseLetter: {},
  trainingTeamLocations: [],
};

export const trainingManagementSlice = createSlice({
  name: 'trainingManagement',
  initialState,
  reducers: {
    saveBipardLocation: (state, { payload }) => {
      state.bipardLocation = payload;
    },
    saveTrainingCategoryList: (state, { payload }) => {
      state.trainingCategoryList = payload;
    },
    saveTrainingCategory: (state, { payload }) => {
      state.trainingCategory = payload;
    },
    saveBudget: (state, { payload }) => {
      state.budget = payload;
    },
    saveBudgetList: (state, { payload }) => {
      state.budgetList = payload;
    },
    saveTrainingList: (state, { payload }) => {
      state.trainingList = payload;
    },
    saveTraining: (state, { payload }) => {
      state.training = payload;
    },
    saveTrainingFullName: (state, { payload }) => {
      state.trainingFullName = payload;
    },
    saveTrainingShortName: (state, { payload }) => {
      state.trainingShortName = payload;
    },
    saveTrainingStartDate: (state, { payload }) => {
      state.trainingStartDate = payload;
    },
    saveTrainingEndDate: (state, { payload }) => {
      state.trainingEndDate = payload;
    },
    saveTrainingType: (state, { payload }) => {
      state.trainingType = payload;
    },
    saveTrainingFee: (state, { payload }) => {
      state.trainingFee = payload;
    },
    saveNatureOfCourse: (state, { payload }) => {
      state.natureOfCourse = payload;
    },
    saveNoOfParticipants: (state, { payload }) => {
      state.noOfParticipants = payload;
    },
    saveParentDepartmentList: (state, { payload }) => {
      state.parentDepartmentList = payload;
    },
    saveParentDepartment: (state, { payload }) => {
      state.parentDepartment = payload;
    },
    saveNoOfSectionAndBatches: (state, { payload }) => {
      state.noOfSectionAndBatches = payload;
    },
    saveStatus: (state, { payload }) => {
      state.status = payload;
    },
    saveCourseThumbnail: (state, { payload }) => {
      state.courseThumbnail = payload;
    },
    saveCourseDesc: (state, { payload }) => {
      state.courseDesc = payload;
    },
    saveHostelList: (state, { payload }) => {
      state.hostelList = payload;
    },
    saveHostel: (state, { payload }) => {
      state.hostel = payload;
    },
    saveCourseCoordinatorList: (state, { payload }) => {
      state.courseCoordinatorList = payload;
    },
    saveCourseCoordinator: (state, { payload }) => {
      state.courseCoordinator = payload;
    },
    saveYoungProfessionalList: (state, { payload }) => {
      state.youngProfessionalList = payload;
    },
    saveYoungProfessional: (state, { payload }) => {
      state.youngProfessional = payload;
    },
    saveCourseLocationList: (state, { payload }) => {
      state.courseLocationList = payload;
    },
    saveCourseLocation: (state, { payload }) => {
      state.courseLocation = payload;
    },
    saveCourseSubLocationList: (state, { payload }) => {
      state.courseSubLocationList = payload;
    },
    saveCourseSubLocation: (state, { payload }) => {
      state.courseSubLocation = payload;
    },
    saveCourseLetter: (state, { payload }) => {
      state.courseLetter = payload;
    },
    saveTrainingTeamLocations: (state, { payload }) => {
      state.trainingTeamLocations = payload;
    },
    resetTrainingManagementState: () => initialState,
    setTrainingEditData: (state, { payload }) => {
      const item = payload;
      if (!item) return;

      const locationMap: any = {
        1: { id: 'Gaya', name: 'Gaya' },
        2: { id: 'Patna', name: 'Patna' },
      };

      state.bipardLocation = locationMap[item.tenantId] || {};

      state.trainingCategory = {
        categoryId: item.trainingCategoryId,
        categoryName: item.trainingCategory,
      };

      state.trainingFullName = item.trainingFullName || '';
      state.trainingShortName = item.trainingShortName || '';

      state.trainingStartDate = item.courseStartDate
        ? moment(item.courseStartDate).format('DD-MM-YYYY')
        : '';

      state.trainingEndDate = item.courseEndDate
        ? moment(item.courseEndDate).format('DD-MM-YYYY')
        : '';

      state.trainingType = { id: item.trainingTypeId, name: item.trainingType };
      state.trainingFee = { id: item.trainingFeeId, name: item.trainingFee };
      state.natureOfCourse = {
        id: item.natureOfCourseId,
        name: item.natureOfCourse,
      };

      state.noOfParticipants = String(item.noOfParticipants || '');
      state.noOfSectionAndBatches = String(item.noOfSections || '');

      state.parentDepartment = {
        id: item.parentDepartmentId,
        name: item.parentDepartment,
      };

      state.status = { id: item.status, value: item.status };

      state.courseThumbnail = { url: item.thumbnail, uri: null };
      state.courseDesc = item.description || '';

      if (item.hostelAllocationOrderId?.length) {
        state.hostel = {
          id: item.hostelAllocationOrderId[0],
          name: item.hostelAllocationOrder[0],
        };
      }

      state.courseCoordinator = {
        id: item.courseCoordinatorId,
        name: item.courseCoordinator,
      };

      state.youngProfessional = {
        id: item.youngProfessionalId,
        name: item.youngProfessional,
      };

      if (item.courseLocation?.length) {
        state.courseLocation = {
          id: item.courseLocation[0],
          name: '',
        };
      }

      if (item.courseSubLocation?.length) {
        state.courseSubLocation = {
          id: item.courseSubLocation[0],
          name: '',
        };
      }

      // Multiple array map
      state.trainingTeamLocations = (item.courseLocation || []).map(
        (loc: any, i: any) => ({
          courseLocation: { id: loc, name: '' },
          courseSubLocation: {
            id: item.courseSubLocation?.[i],
            name: '',
          },
        }),
      );

      state.courseLetter = { url: item.letter, uri: null };

      state.budget = {
        id: item.isBudgetTraining,
        name: item.isBudgetTraining,
      };

      state.training = {
        id: item.budgetTrainingId,
        trainingName: '',
      };
    },
  },
});

export const {
  saveBipardLocation,
  saveTrainingCategoryList,
  saveTrainingCategory,
  saveBudget,
  saveBudgetList,
  saveTraining,
  saveTrainingList,
  saveTrainingFullName,
  saveTrainingShortName,
  saveTrainingStartDate,
  saveTrainingEndDate,
  saveTrainingType,
  saveTrainingFee,
  saveNatureOfCourse,
  saveNoOfParticipants,
  saveParentDepartmentList,
  saveParentDepartment,
  saveNoOfSectionAndBatches,
  saveStatus,
  saveCourseThumbnail,
  saveCourseDesc,
  saveHostelList,
  saveHostel,
  saveCourseCoordinatorList,
  saveCourseCoordinator,
  saveYoungProfessionalList,
  saveYoungProfessional,
  saveCourseLocationList,
  saveCourseLocation,
  saveCourseSubLocationList,
  saveCourseSubLocation,
  saveCourseLetter,
  resetTrainingManagementState,
  saveTrainingTeamLocations,
  setTrainingEditData,
} = trainingManagementSlice.actions;

export default trainingManagementSlice.reducer;
