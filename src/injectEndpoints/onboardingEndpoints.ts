import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    userLogin: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.user_login,
        method: 'POST',
        body: requestParams,
      }),
    }),
    forgotPasswordOtp: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.forgot_password_otp,
        method: 'POST',
        body: requestParams,
      }),
    }),
    forgotPasswordOtpVerify: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.forgot_password_otp_verification,
        method: 'POST',
        body: requestParams,
      }),
    }),
    forgotPasswordSetNewPass: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.forgot_password_set_new_password,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useUserLoginMutation,
  useForgotPasswordOtpMutation,
  useForgotPasswordOtpVerifyMutation,
  useForgotPasswordSetNewPassMutation,
} = apiEndpoints;
