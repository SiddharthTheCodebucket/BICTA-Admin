import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

export interface OtherRegistrationStateType {
  trainingCenterList: { [key: string]: any };
  selectedTrainingCenter: { [key: string]: any };
  trainingNameList: { [key: string]: any };
  selectedTrainingName: { [key: string]: any };
  name: string;
  genderList: { [key: string]: any };
  selectedGender: { [key: string]: any };
  maritalStatusList: { [key: string]: any };
  selectedMaritalStatus: { [key: string]: any };
  pregnancyStatusList: { [key: string]: any };
  selectedPregnancyStatus: { [key: string]: any };
  fatherName: string;
  dob: string;
  aadharNumber: string;
  mobileNumber: string;
  educationalQualificationList: { [key: string]: any };
  selectedEducationalQualification: { [key: string]: any };
  departmentList: { [key: string]: any };
  selectedDepartment: { [key: string]: any };
  designationList: { [key: string]: any };
  selectedDesignation: { [key: string]: any };
  placeOfPosting: string;
  //Address and Office Details
  residentialAddress: string;
  officeAddress: string;
  postingDistrictList: { [key: string]: any };
  selectedPostingDistrict: { [key: string]: any };
  postingBlockList: { [key: string]: any };
  selectedPostingBlock: { [key: string]: any };
  postingPanchyatList: { [key: string]: any };
  selectedPostingPanchyat: { [key: string]: any };
  //Witness and Verification Details
  firstWitnessName: string;
  firstWitnessDesignation: string;
  firstWitnessSignature: { [key: string]: any };
  secondWitnessName: string;
  secondWitnessDesignation: string;
  secondWitnessSignature: { [key: string]: any };
  photo: { [key: string]: any };
  signature: { [key: string]: any };
  aadharCard: { [key: string]: any };
  //Email and OTP Verification
  email: string;
  otp: string;

  roleList: { [key: string]: any };
}
export const initialState: OtherRegistrationStateType = {
  trainingCenterList: [],
  selectedTrainingCenter: {},
  trainingNameList: [],
  selectedTrainingName: {},
  name: '',
  genderList: [],
  selectedGender: {},
  maritalStatusList: [],
  selectedMaritalStatus: {},
  pregnancyStatusList: [
    { id: 'Yes', name: 'Yes' },
    { id: 'No', name: 'No' },
  ],
  selectedPregnancyStatus: {},
  fatherName: '',
  dob: '',
  aadharNumber: '',
  mobileNumber: '',
  educationalQualificationList: [],
  selectedEducationalQualification: {},
  departmentList: [],
  selectedDepartment: {},
  designationList: [],
  selectedDesignation: {},
  placeOfPosting: '',
  residentialAddress: '',
  officeAddress: '',
  postingDistrictList: [],
  selectedPostingDistrict: {},
  postingBlockList: [],
  selectedPostingBlock: {},
  postingPanchyatList: [],
  selectedPostingPanchyat: {},
  firstWitnessName: '',
  firstWitnessDesignation: '',
  firstWitnessSignature: {},
  secondWitnessName: '',
  secondWitnessDesignation: '',
  secondWitnessSignature: {},
  photo: {},
  signature: {},
  aadharCard: {},
  email: '',
  otp: '',
  roleList: [],
};

export const OtherRegistrationSlice = createSlice({
  name: 'OtherRegistration',
  initialState,
  reducers: {
    saveTrainingCenterList: (state, { payload }) => {
      state.trainingCenterList = payload;
    },
    saveSelectedTrainingCenter: (state, { payload }) => {
      state.selectedTrainingCenter = payload;
    },
    saveTrainingNameList: (state, { payload }) => {
      state.trainingNameList = payload;
    },
    saveSelectedTrainingName: (state, { payload }) => {
      state.selectedTrainingName = payload;
    },
    saveName: (state, { payload }) => {
      state.name = payload;
    },
    saveGenderList: (state, { payload }) => {
      state.genderList = payload;
    },
    saveSelectedGender: (state, { payload }) => {
      state.selectedGender = payload;
    },
    saveMaritalStatusList: (state, { payload }) => {
      state.maritalStatusList = payload;
    },
    saveSelectedMaritalStatus: (state, { payload }) => {
      state.selectedMaritalStatus = payload;
    },
    savePregnancyStatusList: (state, { payload }) => {
      state.pregnancyStatusList = payload;
    },
    saveSelectedPregnancyStatus: (state, { payload }) => {
      state.selectedPregnancyStatus = payload;
    },
    saveFatherName: (state, { payload }) => {
      state.fatherName = payload;
    },
    saveDob: (state, { payload }) => {
      state.dob = payload;
    },
    saveAadharNumber: (state, { payload }) => {
      state.aadharNumber = payload;
    },
    saveMobileNumber: (state, { payload }) => {
      state.mobileNumber = payload;
    },
    saveEducationalQualificationList: (state, { payload }) => {
      state.educationalQualificationList = payload;
    },
    saveSelectedEducationalQualification: (state, { payload }) => {
      state.selectedEducationalQualification = payload;
    },
    saveDepartmentList: (state, { payload }) => {
      state.departmentList = payload;
    },
    saveSelectedDepartment: (state, { payload }) => {
      state.selectedDepartment = payload;
    },
    saveDesignationList: (state, { payload }) => {
      state.designationList = payload;
    },
    saveSelectedDesignation: (state, { payload }) => {
      state.selectedDesignation = payload;
    },

    savePlaceOfPosting: (state, { payload }) => {
      state.placeOfPosting = payload;
    },
    saveResidentialAddress: (state, { payload }) => {
      state.residentialAddress = payload;
    },
    saveOfficeAddress: (state, { payload }) => {
      state.officeAddress = payload;
    },
    savePostingDistrictList: (state, { payload }) => {
      state.postingDistrictList = payload;
    },
    saveSelectedPostingDistrict: (state, { payload }) => {
      state.selectedPostingDistrict = payload;
    },
    savePostingBlockList: (state, { payload }) => {
      state.postingBlockList = payload;
    },
    saveSelectedPostingBlock: (state, { payload }) => {
      state.selectedPostingBlock = payload;
    },
    savePostingPanchyatList: (state, { payload }) => {
      state.postingPanchyatList = payload;
    },
    saveSelectedPostingPanchyat: (state, { payload }) => {
      state.selectedPostingPanchyat = payload;
    },
    saveFirstWitnessName: (state, { payload }) => {
      state.firstWitnessName = payload;
    },
    saveFirstWitnessDesignation: (state, { payload }) => {
      state.firstWitnessDesignation = payload;
    },
    saveFirstWitnessSignature: (state, { payload }) => {
      state.firstWitnessSignature = payload;
    },
    saveSecondWitnessName: (state, { payload }) => {
      state.secondWitnessName = payload;
    },
    saveSecondWitnessDesignation: (state, { payload }) => {
      state.secondWitnessDesignation = payload;
    },
    saveSecondWitnessSignature: (state, { payload }) => {
      state.secondWitnessSignature = payload;
    },
    savePhoto: (state, { payload }) => {
      state.photo = payload;
    },
    saveSignature: (state, { payload }) => {
      state.signature = payload;
    },
    saveAadharCard: (state, { payload }) => {
      state.aadharCard = payload;
    },
    saveEmail: (state, { payload }) => {
      state.email = payload;
    },
    saveOtp: (state, { payload }) => {
      state.otp = payload;
    },
    saveRoleList: (state, { payload }) => {
      state.roleList = payload;
    },
    resetOtherRegistrationState: () => initialState,
  },
});

export const {
  saveTrainingCenterList,
  saveSelectedTrainingCenter,
  saveTrainingNameList,
  saveSelectedTrainingName,
  saveName,
  saveGenderList,
  saveSelectedGender,
  saveMaritalStatusList,
  saveSelectedMaritalStatus,
  savePregnancyStatusList,
  saveSelectedPregnancyStatus,
  saveFatherName,
  saveDob,
  saveAadharNumber,
  saveMobileNumber,
  saveEducationalQualificationList,
  saveSelectedEducationalQualification,
  saveDepartmentList,
  saveSelectedDepartment,
  saveDesignationList,
  saveSelectedDesignation,
  savePlaceOfPosting,
  saveResidentialAddress,
  saveOfficeAddress,
  savePostingDistrictList,
  saveSelectedPostingDistrict,
  savePostingBlockList,
  saveSelectedPostingBlock,
  savePostingPanchyatList,
  saveSelectedPostingPanchyat,
  saveFirstWitnessName,
  saveFirstWitnessDesignation,
  saveFirstWitnessSignature,
  saveSecondWitnessName,
  saveSecondWitnessDesignation,
  saveSecondWitnessSignature,
  savePhoto,
  saveSignature,
  saveAadharCard,
  saveEmail,
  saveOtp,
  saveRoleList,
  resetOtherRegistrationState,
} = OtherRegistrationSlice.actions;

export default OtherRegistrationSlice.reducer;
