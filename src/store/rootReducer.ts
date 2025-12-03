import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/authSlice';
import trainingManagementReducer from '../features/TrainingManagement/trainingManagementSlice';
import { apiSlice } from '../api/apiSlice';

export const reducers = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  Auth: authReducer,
  TrainingManagement: trainingManagementReducer,
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
