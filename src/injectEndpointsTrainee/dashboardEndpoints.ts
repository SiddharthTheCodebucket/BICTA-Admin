import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    eventList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.event_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    noticeList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.notice_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listNoticeResponseUser: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_notice_response_user,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useEventListMutation,
  useNoticeListMutation,
  useListNoticeResponseUserMutation,
} = apiEndpoints;
