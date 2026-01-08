import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listFeedbackCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_feedback_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateFeedbackCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_feedback_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteFeedbackCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_feedback_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addFeedbackCategory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_feedback_category,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listFeedbackTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_feedback_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addFeedbackTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_feedback_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateFeedbackTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_feedback_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteFeedbackTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_feedback_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listOverallTrainingFeedback: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_overallS_training_feedback,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListFeedbackCategoryMutation,
  useUpdateFeedbackCategoryMutation,
  useDeleteFeedbackCategoryMutation,
  useAddFeedbackCategoryMutation,
  useListFeedbackTopicMutation,
  useAddFeedbackTopicMutation,
  useUpdateFeedbackTopicMutation,
  useDeleteFeedbackTopicMutation,
  useListOverallTrainingFeedbackMutation,
} = apiEndpoints;
