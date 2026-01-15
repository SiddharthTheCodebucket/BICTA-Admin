import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    courseReportListBasicInfo: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.courseReport_list_basic_info,
        method: 'POST',
        body: requestParams,
      }),
    }),
    courseReportDeleteBasicInfo: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.courseReport_delete_basic_info,
        method: 'POST',
        body: requestParams,
      }),
    }),
    courseReportDownload: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.courseReport_download,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useCourseReportListBasicInfoMutation,
  useCourseReportDeleteBasicInfoMutation,
  useCourseReportDownloadMutation,
} = apiEndpoints;
