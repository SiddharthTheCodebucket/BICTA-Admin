import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    guestList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.guest_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteGuest: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_guest,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addGuest: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_guest,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateGuest: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_guest,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useGuestListMutation,
  useDeleteGuestMutation,
  useAddGuestMutation,
  useUpdateGuestMutation,
} = apiEndpoints;
