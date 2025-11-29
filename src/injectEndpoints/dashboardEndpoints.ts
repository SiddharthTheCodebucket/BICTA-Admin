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
    hostelData: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_data,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelRoomDetailsData: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_room_details_dashboard,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelBedDetailsData: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_bed_details_dashboard,
        method: 'POST',
        body: requestParams,
      }),
    }),
    dashboardBlockBedList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.dashboard_block_bed_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    dashboardUnblockBed: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.dashboard_unblock_bed_list,
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
  useHostelDataMutation,
  useHostelRoomDetailsDataMutation,
  useHostelBedDetailsDataMutation,
  useDashboardBlockBedListMutation,
  useDashboardUnblockBedMutation,
} = apiEndpoints;
