import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listVehicleDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_vehicle_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateVehicleDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_vehicle_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addVehicleDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_vehicle_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteVehicleDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_vehicle_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    commonDropdownList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.common_get_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    commonFileUpload: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.common_file_upload,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listAssignedUpload: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_assigned_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    removedAssignedUpload: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.removed_assigned_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    assignNewDriver: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.assign_new_driver,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listAssignVehicleDriver: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_assign_vehicle_driver,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteAssignVehicle: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_assign_vehicle,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addAssignVehicle: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_assign_vehicle,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateAssignVehicle: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_assign_vehicle,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listTripDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_trip_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addTripDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_trip_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateTripDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_trip_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteTripDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_trip_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListVehicleDetailsMutation,
  useUpdateVehicleDetailsMutation,
  useAddVehicleDetailsMutation,
  useDeleteVehicleDetailsMutation,
  useCommonDropdownListMutation,
  useCommonFileUploadMutation,
  useListAssignedUploadMutation,
  useRemovedAssignedUploadMutation,
  useAssignNewDriverMutation,
  useListAssignVehicleDriverMutation,
  useDeleteAssignVehicleMutation,
  useAddAssignVehicleMutation,
  useUpdateAssignVehicleMutation,
  useListTripDetailsMutation,
  useAddTripDetailsMutation,
  useUpdateTripDetailsMutation,
  useDeleteTripDetailsMutation,
} = apiEndpoints;
