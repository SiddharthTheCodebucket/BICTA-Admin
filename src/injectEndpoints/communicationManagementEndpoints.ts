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
    communicationListAnnouncement: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_list_announcement,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationAddAnnouncement: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_add_announcement,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationUpdateAnnouncement: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_update_announcement,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationListScn: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_list_scn,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationUpdateScn: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_update_scn,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationListNoticeRes: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_list_notice_res,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationListTraineeLeave: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_list_trainee_leave,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationListTraineeCount: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_list_trainee_count,
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
  useCommunicationListAnnouncementMutation,
  useCommunicationAddAnnouncementMutation,
  useCommunicationUpdateAnnouncementMutation,
  useCommunicationListScnMutation,
  useCommunicationUpdateScnMutation,
  useCommunicationListNoticeResMutation,
  useCommunicationListTraineeLeaveMutation,
  useCommunicationListTraineeCountMutation,
} = apiEndpoints;
