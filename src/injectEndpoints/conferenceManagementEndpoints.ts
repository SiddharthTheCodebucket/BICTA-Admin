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
    conferenceListManthan: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_list_manthan,
        method: 'POST',
        body: requestParams,
      }),
    }),
    conferenceListGuestDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_list_guest_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    conferenceDeleteConference: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_delete_conference,
        method: 'POST',
        body: requestParams,
      }),
    }),
    conferenceUpdateConference: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_update_conference,
        method: 'POST',
        body: requestParams,
      }),
    }),
    conferenceAddConference: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.conference_add_conference,
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
  useConferenceListManthanMutation,
  useConferenceListGuestDetailsMutation,
  useConferenceDeleteConferenceMutation,
  useConferenceAddConferenceMutation,
  useConferenceUpdateConferenceMutation,
} = apiEndpoints;
