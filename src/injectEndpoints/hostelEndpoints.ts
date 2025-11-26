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
    hostelDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateHostelDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_hostel_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteHostelDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_hostel_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addHostelDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_hostel_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelFloorDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_floor_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteHostelFloor: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_hostel_floor,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addHostelFloor: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_hostel_floor,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateHostelFloor: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_hostel_floor,
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
  useHostelDetailsMutation,
  useUpdateHostelDetailsMutation,
  useDeleteHostelDetailsMutation,
  useAddHostelDetailsMutation,
  useHostelFloorDetailsMutation,
  useDeleteHostelFloorMutation,
  useAddHostelFloorMutation,
  useUpdateHostelFloorMutation,
} = apiEndpoints;
