import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpointsTrainee';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    hostelAllocationDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_hostel_allocation_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const { useHostelAllocationDetailsMutation } = apiEndpoints;
