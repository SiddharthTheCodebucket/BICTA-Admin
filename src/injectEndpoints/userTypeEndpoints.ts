import { apiSlice } from '../api/apiSlice';
import endpoints from '../constants/endpoints';

const apiEndpoints = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listInternalUser: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_internal_user,
        method: 'POST',
        body: requestParams,
      }),
    }),
    approveInternalUserStatus: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.approve_internal_user_status,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteInternalUserStatus: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_internal_user,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listAdminRole: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_admin_role,
        method: 'POST',
        body: requestParams,
      }),
    }),
    addAdminRole: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.add_admin_role,
        method: 'POST',
        body: requestParams,
      }),
    }),
    updateAdminRole: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.update_admin_role,
        method: 'POST',
        body: requestParams,
      }),
    }),
    deleteAdminRole: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.delete_admin_role,
        method: 'POST',
        body: requestParams,
      }),
    }),
    listPermissionsName: builder.mutation<any, any>({
      query: requestParams => ({
        url: endpoints.list_permissions_name,
        method: 'POST',
        body: requestParams,
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useListInternalUserMutation,
  useApproveInternalUserStatusMutation,
  useDeleteInternalUserStatusMutation,
  useListAdminRoleMutation,
  useAddAdminRoleMutation,
  useUpdateAdminRoleMutation,
  useDeleteAdminRoleMutation,
  useListPermissionsNameMutation,
} = apiEndpoints;
