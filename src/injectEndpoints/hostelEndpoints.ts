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
    hostelRoomDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_room_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateHostelRoom: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_hostel_room,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteHostelRoom: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_hostel_room,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addHostelRoom: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_hostel_room,
        method: 'POST',
        body: requestParams,
      }),
    }),
    bedDetailsRoom: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.bed_details_room,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateBedDetailsRoom: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_bed_details_room,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteBedDetailsRoom: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_bed_details_room,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addBedDetailsRoom: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_bed_details_room,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelAllocationDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_allocation_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelAllocationDelete: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_allocation_delete,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelRelease: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_release,
        method: 'POST',
        body: requestParams,
      }),
    }),
    hostelAllocation: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.hostel_allocation,
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
  useHostelRoomDetailsMutation,
  useUpdateHostelRoomMutation,
  useDeleteHostelRoomMutation,
  useAddHostelRoomMutation,
  useBedDetailsRoomMutation,
  useUpdateBedDetailsRoomMutation,
  useDeleteBedDetailsRoomMutation,
  useAddBedDetailsRoomMutation,
  useHostelAllocationDetailsMutation,
  useHostelAllocationDeleteMutation,
  useHostelReleaseMutation,
  useHostelAllocationMutation,
} = apiEndpoints;
