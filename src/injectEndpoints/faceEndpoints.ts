import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const faceEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    addDevice: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_device,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateDevice: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_device,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listDevice: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_device,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addMatchLog: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_match_log,
        method: 'POST',
        body: requestParams,
      }),
    }),
    matchDeviceSecretKey: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.match_device_secret_key,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useAddDeviceMutation,
  useUpdateDeviceMutation,
  useListDeviceMutation,
  useAddMatchLogMutation,
  useMatchDeviceSecretKeyMutation,
} = faceEndpoints;
