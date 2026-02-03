import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    visitorListQrCode: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.visitor_list_qr_code,
        method: 'POST',
        body: requestParams,
      }),
    }),
    visitorListVisitor: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.visitor_list_visitor,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const { useVisitorListQrCodeMutation, useVisitorListVisitorMutation } =
  apiEndpoints;
