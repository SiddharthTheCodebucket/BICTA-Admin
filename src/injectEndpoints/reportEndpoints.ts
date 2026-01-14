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
  }),
  overrideExisting: false,
});
export const {
  useReportListFacultyMutation,
  useReportUploadHonorariumMutation,
} = apiEndpoints;
