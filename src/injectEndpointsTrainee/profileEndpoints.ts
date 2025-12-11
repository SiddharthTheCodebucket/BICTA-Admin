import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listTraineeDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    commonDropdownList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.common_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTraineeDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_trainee_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downlaodRegistrationForm: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_registration_form,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTraineeManageIndemnityBond: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_manage_indemnity_bond,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTraineeManageIndemnityBond: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_trainee_manage_indemnity_bond,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTraineeManageIndemnityBond: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_trainee_manage_indemnity_bond,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListTraineeDetailsMutation,
  useCommonDropdownListMutation,
  useUpdateTraineeDetailsMutation,
  useDownlaodRegistrationFormMutation,
  useListTraineeManageIndemnityBondMutation,
  useUpdateTraineeManageIndemnityBondMutation,
  useDownloadTraineeManageIndemnityBondMutation,
  useDeleteTraineeRegistrationMutation,
} = apiEndpoints;
