import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listfeedbackResponse: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_feedback_response,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addFeedbackResponse: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_feedback_response,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addOverallFeedbackResponse: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_overall_feedback_response,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListfeedbackResponseMutation,
  useAddFeedbackResponseMutation,
  useAddOverallFeedbackResponseMutation,
} = apiEndpoints;
