import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    budgetListTraining: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_list_training,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetAddTraining: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_add_training,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetUpdateTraining: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_update_training,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetDeleteTraining: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_delete_training,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetListParticulars: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_list_particulars,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetAddParticulars: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_add_particulars,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetUpdateParticulars: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_update_particulars,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetDeleteParticulars: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_delete_particulars,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetListDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_list_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    budgetDeleteDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.budget_delete_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useBudgetListTrainingMutation,
  useBudgetAddTrainingMutation,
  useBudgetUpdateTrainingMutation,
  useBudgetDeleteTrainingMutation,
  useBudgetListParticularsMutation,
  useBudgetAddParticularsMutation,
  useBudgetUpdateParticularsMutation,
  useBudgetDeleteParticularsMutation,
  useBudgetListDetailsMutation,
  useBudgetDeleteDetailsMutation,
} = apiEndpoints;
