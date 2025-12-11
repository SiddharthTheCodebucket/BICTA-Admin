import { createSlice } from '@reduxjs/toolkit';
export interface ProfileStateType {
  profileData: { [key: string]: any };
}
export const initialState: ProfileStateType = {
  profileData: {},
};
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    saveProfileData: (state, { payload }) => {
      state.profileData = payload;
    },
  },
});
export const { saveProfileData } = authSlice.actions;

export default authSlice.reducer;
