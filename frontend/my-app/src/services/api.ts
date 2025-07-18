// services/api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, User, ContentItem, ContentResponse } from "../types";
import { baseQueryWithReauth } from "./baseQuery";
import { ReactNode } from "react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Content"],
  endpoints: (builder) => ({
    me: builder.query<ApiResponse<User>, void>({
      query: () => `/users/me`,
      providesTags: ["User", 'Content'],
    }),

    login: builder.mutation<
      ApiResponse<{ accessToken: string; refreshToken: string }>,
      { email: string; password: string }
    >({
      query: (body) => ({
        url: `/users/login`,
        method: "POST",
        body,
      }),
    }),

    register: builder.mutation<
      ApiResponse<User>,
      Omit<User, "_id" | "active" | "role" | "plan" | "subscribedApis" | "credit" | "createdAt" | "updatedAt"> & { confirmPassword: string }
    >({
      query: (body) => ({
        url: `/users/create`,
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: `/users/logout`,
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    refreshToken: builder.mutation<ApiResponse<{ accessToken: string }>,
      { refreshToken: string }
    >({
      query: (body) => ({
        url: `/users/refresh`,
        method: "POST",
        body,
      }),
    }),
    createContent: builder.mutation<ApiResponse<{ content: ContentItem }>, Partial<ContentItem>>({
      query: (body) => ({
        url: `/content/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Content"],
    }),

  getAllContent: builder.query<ApiResponse<{ content: ContentItem[] }>, void>({
    query: () => `/content/all`,
    providesTags: ["Content"],
  }),
  updateContent: builder.mutation<ApiResponse<{ content: ContentItem }>, { id: string; content: Partial<ContentItem> }>({
    query: ({ id, content }) => ({
      url: `/content/${id}`,
      method: "PUT",
      body: content,
    }),
    invalidatesTags: ["Content"],
  }),
  getContentById: builder.query<ApiResponse<{ content: ContentItem }>, string>({
    query: (id) => `/content/${id}`,
    providesTags: ["Content"],
  }),
  deleteContent: builder.mutation<ApiResponse<{ message: string }>, string>({
    query: (id) => ({
      url: `/content/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: ["Content"],
  }),
  searchPinecone: builder.mutation<ApiResponse<{ results: ContentItem[] }>, { query: string }>({
    query: (body) => ({
      url: `/content/search`,
      method: "POST",
      body,
    }),
    invalidatesTags: ["Content"],
  }),
  rag: builder.mutation<ApiResponse<{ response: string }>, { id: string; query: string }>({
    query: ({ id, query }) => ({
      url: `/content/chat/${id}`,
      method: "POST",
      body: { query },
    }),
    invalidatesTags: ["Content"],
  }),
  
  }), 
});
export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useGetAllContentQuery,
  useLogoutMutation,
  useGetContentByIdQuery,
  useUpdateContentMutation,
  useCreateContentMutation,
  useDeleteContentMutation,
  useRefreshTokenMutation,
  
} = api;