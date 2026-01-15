import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    reportListFaculty: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_list_faculty,
        method: 'POST',
        body: requestParams,
      }),
    }),
    reportUploadHonorarium: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_upload_honorarium,
        method: 'POST',
        body: requestParams,
      }),
    }),
    reportListFacultyFutureClassCount: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_list_faculty_future_class_count,
        method: 'POST',
        body: requestParams,
      }),
    }),
    reportListTimeTable: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.report_list_time_table,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useReportListFacultyMutation,
  useReportUploadHonorariumMutation,
  useReportListFacultyFutureClassCountMutation,
  useReportListTimeTableMutation,
} = apiEndpoints;
