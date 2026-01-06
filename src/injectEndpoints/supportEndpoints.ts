import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listSupportRaiseComplain: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_support_raise_complain,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteSupportRaiseComplain: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_support_raise_complain,
        method: 'POST',
        body: requestParams,
      }),
    }),
    resolveSupportRaiseComplain: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.resolve_support_raise_complain,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListSupportRaiseComplainMutation,
  useDeleteSupportRaiseComplainMutation,
  useResolveSupportRaiseComplainMutation,
} = apiEndpoints;
