import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    vendorDashboard: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.vendor_dashboard,
        method: 'POST',
        body: requestParams,
      }),
    }),
    vendorList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_vendor,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelPlanningData: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_planning_data,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelReportData: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_report_data,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useVendorDashboardMutation,
  useVendorListMutation,
  useHostelPlanningDataMutation,
  useHostelReportDataMutation,
} = apiEndpoints;
