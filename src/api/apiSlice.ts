import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../config';
import type { RootState } from '../store';

const baseQueryWithStatus: BaseQueryFn<
  string | FetchArgs,
  { _status?: number },
  FetchBaseQueryError & { _status?: number },
  {},
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    timeout: 30000,
    prepareHeaders: (headers, api) => {
      const token = (api.getState() as RootState).Auth?.token;
      if (token) {
        headers.set('token', token);
      }
      return headers;
    },
  });

  const result = await rawBaseQuery(args, api, extraOptions);
  const status = result?.meta?.response?.status;

  if ('error' in result) {
    return {
      error: {
        ...(result.error as FetchBaseQueryError),
        _status: status,
      },
      meta: result.meta,
    };
  }

  return {
    data: {
      ...(result.data as object),
      _status: status,
    },
    meta: result.meta,
  };
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithStatus,
  endpoints: () => ({}),
});
