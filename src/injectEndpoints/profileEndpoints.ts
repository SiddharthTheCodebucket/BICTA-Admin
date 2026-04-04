import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    deleteTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    checkDeviceRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: 'device/check-registration', // Placeholder
        method: 'POST',
        body: requestParams,
      }),
    }),
    registerDevice: builder.mutation<any, any>({
      query: requestParams => ({
        url: 'device/register', // Placeholder
        method: 'POST',
        body: requestParams,
      }),
    }),
    markAttendance: builder.mutation<any, any>({
      query: requestParams => ({
        url: 'attendance/mark', // Placeholder
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useDeleteTraineeRegistrationMutation,
  useCheckDeviceRegistrationMutation,
  useRegisterDeviceMutation,
  useMarkAttendanceMutation,
} = apiEndpoints;
