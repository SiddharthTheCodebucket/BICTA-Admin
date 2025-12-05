import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTrainingCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_training_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addFileNoTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_fileNo_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTraineeLoginDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_trainee_login_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    extendTrainingEndDate: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.extend_training_end_date,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTrainingDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_training_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTrainingBatchDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_training_batch_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTrainingBatchDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_training_batch_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTraineeDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    mergeTrainingBatchDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.merge_training_batch_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTraineeRegistrationBulk: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_trainee_registration_bulk,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
    approveTrainingIdCard: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.approve_training_id_card,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTrainingIdCard: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_training_id_card,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTraineeRegForm: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_trainee_reg_form,
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
    downloadTraineeManageIndemnityBond: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_trainee_manage_indemnity_bond,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadTraineeDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_trainee_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListTrainingCategoryMutation,
  useAddTrainingCategoryMutation,
  useUpdateTrainingCategoryMutation,
  useDownloadTrainingCategoryMutation,
  useListTrainingDetailsMutation,
  useAddFileNoTrainingDetailsMutation,
  useUpdateTraineeLoginDetailsMutation,
  useExtendTrainingEndDateMutation,
  useDeleteTrainingDetailsMutation,
  useAddTrainingDetailsMutation,
  useUpdateTrainingDetailsMutation,
  useListTrainingBatchDetailsMutation,
  useUpdateTrainingBatchDetailsMutation,
  useListTraineeDetailsMutation,
  useMergeTrainingBatchDetailsMutation,
  useListTraineeRegistrationMutation,
  useAddTraineeRegistrationBulkMutation,
  useAddTraineeRegistrationMutation,
  useUpdateTraineeRegistrationMutation,
  useApproveTrainingIdCardMutation,
  useDownloadTrainingIdCardMutation,
  useDownloadTraineeRegFormMutation,
  useListTraineeManageIndemnityBondMutation,
  useDownloadTraineeManageIndemnityBondMutation,
  useDownloadTraineeDetailsMutation,
} = apiEndpoints;
