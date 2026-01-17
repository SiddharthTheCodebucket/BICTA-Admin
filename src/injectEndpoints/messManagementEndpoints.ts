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
} = apiEndpoints;
