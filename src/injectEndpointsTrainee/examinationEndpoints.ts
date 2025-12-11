import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listExaminationSubReport: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_examination_sub_report,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listExaminationSubAnsReport: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_examination_sub_ans_report,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListExaminationSubReportMutation,
  useListExaminationSubAnsReportMutation,
} = apiEndpoints;
