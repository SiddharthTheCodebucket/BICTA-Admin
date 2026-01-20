import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    conferenceListConference: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_list_conference,
        method: 'POST',
        body: requestParams,
      }),
    }),
    conferenceGuestSeniorityList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_guest_conference_seniority_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    conferenceListManagementInchargeDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_list_management_incharge_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useConferenceListConferenceMutation,
  useConferenceGuestSeniorityListMutation,
  useConferenceListManagementInchargeDetailsMutation,
} = apiEndpoints;
