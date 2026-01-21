import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    hrmsListEmployee: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_list_employee,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsCreditLeaveBalance: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_credit_leave_balance,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsListLeaveBalance: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_list_leave_balance,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsListLeaveRequest: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_list_leave_request,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsDeleteLeaveRequest: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_delete_leave_request,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsAddLeaveRequest: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_add_leave_request,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsUpdateLeaveRequest: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_update_leave_request,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsListApprovalHistory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_list_approval_history,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsAssignApprovalOfficer: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_assign_approval_officer,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsListVendorDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_list_vendor_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hrmsBlacklistingVendor: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hrms_blacklisting_vendor,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useHrmsListEmployeeMutation,
  useHrmsCreditLeaveBalanceMutation,
  useHrmsListLeaveBalanceMutation,
  useHrmsListLeaveRequestMutation,
  useHrmsDeleteLeaveRequestMutation,
  useHrmsAddLeaveRequestMutation,
  useHrmsUpdateLeaveRequestMutation,
  useHrmsListApprovalHistoryMutation,
  useHrmsAssignApprovalOfficerMutation,
  useHrmsListVendorDetailsMutation,
  useHrmsBlacklistingVendorMutation,
} = apiEndpoints;
