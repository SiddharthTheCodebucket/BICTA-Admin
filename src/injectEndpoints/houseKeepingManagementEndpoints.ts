import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    houseKeepingListTaskMaster: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.house_keeping_list_task_master,
        method: 'POST',
        body: requestParams,
      }),
    }),
    houseKeepingDeleteTaskMaster: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.house_keeping_delete_task_master,
        method: 'POST',
        body: requestParams,
      }),
    }),
    houseKeepingAddTaskMaster: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.house_keeping_add_task_master,
        method: 'POST',
        body: requestParams,
      }),
    }),
    houseKeepingUpdateTaskMaster: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.house_keeping_update_task_master,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useHouseKeepingListTaskMasterMutation,
  useHouseKeepingDeleteTaskMasterMutation,
  useHouseKeepingAddTaskMasterMutation,
  useHouseKeepingUpdateTaskMasterMutation,
} = apiEndpoints;
