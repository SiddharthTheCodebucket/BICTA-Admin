import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    submitNoticeResponse: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.submit_notice_response,
        method: 'POST',
        body: requestParams,
      }),
    }),
    communicationListApplicationUser: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.communication_list_application_user,
        method: 'POST',
        body: requestParams,
      }),
    }),
    downloadApplicationPdf: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.download_application_pdf,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useSubmitNoticeResponseMutation,
  useCommunicationListApplicationUserMutation,
  useDownloadApplicationPdfMutation,
} = apiEndpoints;
