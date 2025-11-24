import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    deleteTraineeRegistration: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_trainee_registration,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const { useDeleteTraineeRegistrationMutation } = apiEndpoints;
