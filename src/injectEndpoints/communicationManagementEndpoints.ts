import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    communicationListApplication: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_list_application,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationUpdateApplication: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_update_application,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useCommunicationListApplicationMutation,
  useCommunicationUpdateApplicationMutation,
} = apiEndpoints;
