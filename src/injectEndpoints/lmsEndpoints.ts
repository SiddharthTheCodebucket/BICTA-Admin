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
} = apiEndpoints;
