import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/authSlice';
import trainingManagementReducer from '../features/TrainingManagement/trainingManagementSlice';
import otherRegistrationReducer from '../features/OtherRegistration/otherRegistrationSlice';
import profileReducer from '../featuresTrainee/Profile/profileSlice';
import registrationReducer from '../featuresTrainee/Registration/registrationSlice';
import { apiSlice } from '../api/apiSlice';

export const reducers = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  Auth: authReducer,
  TrainingManagement: trainingManagementReducer,
  otherRegistration: otherRegistrationReducer,
  Profile: profileReducer,
  Registration: registrationReducer,
});

const resetAction = { type: 'RESET' };
const initialState = reducers(undefined, resetAction);

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET') {
    return reducers(
      {
        ...initialState,
        // Auth: {
        //   ...initialState.Auth,
        // },
      },
      action,
    );
  }
  return reducers(state, action);
};
export default rootReducer;
