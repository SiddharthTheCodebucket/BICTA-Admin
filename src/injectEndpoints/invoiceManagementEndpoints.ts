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
  }),
  overrideExisting: false,
});
export const { useListVendorRequestMovemnetMutation } = apiEndpoints;
