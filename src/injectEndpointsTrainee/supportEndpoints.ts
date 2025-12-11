import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    supportList: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.support_list,
        method: 'POST',
        body: requestParams,
      }),
    }),
    supportListTicketMovement: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.support_list_ticket_movement,
        method: 'POST',
        body: requestParams,
      }),
    }),
    supportResolveComplain: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.support_resolve_complain,
        method: 'POST',
        body: requestParams,
      }),
    }),
    supportAddComplain: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.support_add_complain,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useSupportListMutation,
  useSupportListTicketMovementMutation,
  useSupportResolveComplainMutation,
  useSupportAddComplainMutation,
} = apiEndpoints;
