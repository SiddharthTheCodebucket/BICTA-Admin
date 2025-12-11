import { createSlice } from '@reduxjs/toolkit';

export interface RegistrationStateType {
  trainingName: string;
  isAlreadyRegistered: any;
  trainingCenterList: any[];
  trainingCenter: { [key: string]: any };

  name: string;
  dob: string;

  genderList: any[];
  selectedGender: { [key: string]: any };

  maritalStatusList: any[];
  selectedMaritalStatus: { [key: string]: any };

  pregnancyStatus: { [key: string]: any };

  departmentList: any[];
  selecteddepartment: { [key: string]: any };

  placeOfPosting: string;
  aadharNumber: string;

  bloodGroupList: any[];
  selectedBloodGroup: { [key: string]: any };

  photoUri: string;
  uploadedPhoto: { [key: string]: any };

  signatureUri: string;
  uploadedSignature: { [key: string]: any };

  mobileNumber: string;
  officeEmail: string;

  qrData: { [key: string]: any };
}

export const initialState: RegistrationStateType = {
  trainingName: '',
  isAlreadyRegistered: {},

  trainingCenterList: [],
  trainingCenter: {},

  name: '',
  dob: '',

  genderList: [],
  selectedGender: {},

  maritalStatusList: [],
  selectedMaritalStatus: {},

  pregnancyStatus: {},

  departmentList: [],
  selecteddepartment: {},

  placeOfPosting: '',
  aadharNumber: '',

  bloodGroupList: [],
  selectedBloodGroup: {},

  photoUri: '',
  uploadedPhoto: {},

  signatureUri: '',
  uploadedSignature: {},

  mobileNumber: '',
  officeEmail: '',

  qrData: {},
};

export const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    saveRegistrationState: (state, { payload }) => {
      return { ...state, ...payload };
    },

    resetRegistrationState: () => initialState,
  },
});

export const { saveRegistrationState, resetRegistrationState } =
  registrationSlice.actions;

export default registrationSlice.reducer;
