import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listVendorRequestMovemnet: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_vendor_request_movemnet,
        method: 'POST',
        body: requestParams,
      }),
    }),
    assigneeListVendor: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.assignee_list_vendor,
        method: 'POST',
        body: requestParams,
      }),
    }),
    assigneeAddVendor: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.assignee_add_vendor,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listVendorPaymentHistory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_vendor_payment_history,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addVendorPaymentHistory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_vendor_payment_history,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateVendorPaymentHistory: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_vendor_payment_history,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListVendorRequestMovemnetMutation,
  useAssigneeListVendorMutation,
  useAssigneeAddVendorMutation,
  useListVendorPaymentHistoryMutation,
  useAddVendorPaymentHistoryMutation,
  useUpdateVendorPaymentHistoryMutation,
} = apiEndpoints;
