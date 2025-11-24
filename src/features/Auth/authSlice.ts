import {createSlice} from '@reduxjs/toolkit';
export interface AuthStateType {
  token: string;
  crediantialData: {[key: string]: any};
}
export const initialState: AuthStateType = {
  token: '',
  crediantialData: {},
};
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    saveToken: (state, {payload}) => {
      state.token = payload;
    },
    saveCrediantial: (state, {payload}) => {
      state.crediantialData = payload;
    },
  },
});
export const {saveToken, saveCrediantial} = authSlice.actions;

export default authSlice.reducer;
