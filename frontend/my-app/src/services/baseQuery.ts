// services/baseQuery.ts
import { fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { RootState } from '../store/store';
import { setTokens, resetTokens } from '../store/reducers/authReducer';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include', 
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
  ) => {
    let result = await rawBaseQuery(args, api, extraOptions);
  
    if (result.error && result.error.status === 401) {
      // Attempt refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        api.dispatch(resetTokens());
        return result;
      }

      const refreshResult = await rawBaseQuery(
        {
          url: '/users/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
  
      if (refreshResult.data && (refreshResult.data as any).data?.accessToken) {
        const newAccessToken = (refreshResult.data as any).data.accessToken;
  
        // Save to localStorage and Redux
        localStorage.setItem('access_token', newAccessToken);
        api.dispatch(setTokens({ accessToken: newAccessToken, refreshToken: refreshToken }));
  
        // Retry the original query
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // If refresh fails, logout
        api.dispatch(resetTokens());
      }
    }
  
    return result;
  };
  
