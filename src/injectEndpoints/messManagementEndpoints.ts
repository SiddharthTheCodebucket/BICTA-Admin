import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    messManagementListItemBrand: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_list_item_brand,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementAddItemBrand: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_add_item_brand,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementUpdateItemBrand: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_update_item_brand,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementDeleteItemBrand: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_delete_item_brand,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementListItemType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_list_item_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementAddItemType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_add_item_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementUpdateItemType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_update_item_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementDeleteItemType: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_delete_item_type,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementListItem: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_list_item,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementAddItem: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_add_item,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementUpdateItem: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_update_item,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementDeleteItem: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_delete_item,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementListMess: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_list_mess,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementAddMess: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_add_mess,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementUpdateMess: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_update_mess,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementDeleteMess: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_delete_mess,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementListMessTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_list_mess_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementAddMessTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_add_mess_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementUpdateMessTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_update_mess_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementDeleteMessTopic: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_delete_mess_topic,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementMessStockReport: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_mess_stock_report,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementListStockDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_list_stock_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementAddStockDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_add_stock_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementUpdateStockDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_update_stock_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementDeleteStockDetails: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_delete_stock_details,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementListStockConsumption: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_list_stock_consumption,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementAddStockConsumption: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_add_stock_consumption,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementUpdateStockConsumption: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_update_stock_consumption,
        method: 'POST',
        body: requestParams,
      }),
    }),
    messManagementDeleteStockConsumption: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.mess_management_delete_stock_consumption,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useMessManagementListItemBrandMutation,
  useMessManagementAddItemBrandMutation,
  useMessManagementUpdateItemBrandMutation,
  useMessManagementDeleteItemBrandMutation,
  useMessManagementListItemTypeMutation,
  useMessManagementAddItemTypeMutation,
  useMessManagementUpdateItemTypeMutation,
  useMessManagementDeleteItemTypeMutation,
  useMessManagementListItemMutation,
  useMessManagementAddItemMutation,
  useMessManagementUpdateItemMutation,
  useMessManagementDeleteItemMutation,
  useMessManagementListMessMutation,
  useMessManagementAddMessMutation,
  useMessManagementUpdateMessMutation,
  useMessManagementDeleteMessMutation,
  useMessManagementListMessTopicMutation,
  useMessManagementAddMessTopicMutation,
  useMessManagementUpdateMessTopicMutation,
  useMessManagementDeleteMessTopicMutation,
  useMessManagementMessStockReportMutation,
  useMessManagementListStockDetailsMutation,
  useMessManagementAddStockDetailsMutation,
  useMessManagementUpdateStockDetailsMutation,
  useMessManagementDeleteStockDetailsMutation,
  useMessManagementListStockConsumptionMutation,
  useMessManagementAddStockConsumptionMutation,
  useMessManagementUpdateStockConsumptionMutation,
  useMessManagementDeleteStockConsumptionMutation,
} = apiEndpoints;
