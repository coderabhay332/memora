// services/api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse, User, ContentItem } from "../types";
import {
  IChat,
  CreateChatResponse,
  GetChatResponse,
  AddMessageRequest,
  AddMessageResponse,
  DeleteChatResponse,
} from "../types/chat"; // Assuming your chat types are in this path
import { baseQueryWithReauth } from "./baseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Content", "Chat"], // Added "Chat" tag type
  endpoints: (builder) => ({
    // ... your existing endpoints
    me: builder.query<ApiResponse<User>, void>({
      query: () => `/users/me`,
      providesTags: ["User", "Content"],
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
      Omit<
        User,
        | "_id"
        | "active"
        | "role"
        | "plan"
        | "subscribedApis"
        | "credit"
        | "createdAt"
        | "updatedAt"
      > & { confirmPassword: string }
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
      invalidatesTags: ["User", "Chat"], // Invalidate chat on logout
    }),

    refreshToken: builder.mutation<
      ApiResponse<{ accessToken: string }>,
      { refreshToken: string }
    >({
      query: (body) => ({
        url: `/users/refresh`,
        method: "POST",
        body,
      }),
    }),
    createContent: builder.mutation<
      ApiResponse<{ content: ContentItem }>,
      Partial<ContentItem>
    >({
      query: (body) => ({
        url: `/content/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Content"],
    }),

    getAllContent: builder.query<ApiResponse<{ content: ContentItem[] }>, void>(
      {
        query: () => `/content/all`,
        providesTags: ["Content"],
      }
    ),
    updateContent: builder.mutation<
      ApiResponse<{ content: ContentItem }>,
      { id: string; content: Partial<ContentItem> }
    >({
      query: ({ id, content }) => ({
        url: `/content/${id}`,
        method: "PUT",
        body: content,
      }),
      invalidatesTags: ["Content"],
    }),
    getContentById: builder.query<
      ApiResponse<{ content: ContentItem }>,
      string
    >({
      query: (id) => `/content/${id}`,
      providesTags: (result, error, id) => [{ type: "Content", id }],
    }),
    deleteContent: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/content/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Content"],
    }),
    searchPinecone: builder.mutation<
      ApiResponse<{ results: ContentItem[] }>,
      { query: string }
    >({
      query: (body) => ({
        url: `/content/search`,
        method: "POST",
        body,
      }),
    }),
    rag: builder.mutation<
      ApiResponse<{ response: string }>,
      { id: string; query: string }
    >({
      query: ({ id, query }) => ({
        url: `/content/chat/${id}`,
        method: "POST",
        body: { query },
      }),
    }),

    // Chat API endpoints
    createChat: builder.mutation<IChat, void>({
      query: () => ({
        url: "/chat/create",
        method: "POST",
      }),
      invalidatesTags: ["Chat"],
    }),

    getChat: builder.query<GetChatResponse, string>({
      query: (chatId) => `/chat/${chatId}`,
      providesTags: (result, error, id) => [{ type: "Chat", id }],
    }),

    getAllChats: builder.query<{ success: boolean; data: IChat[] }, void>({
      query: () => "/chat", // Corrected the query URL to match your ChatApiService
      providesTags: (result, error, arg) =>
        // Check for BOTH result AND result.data before mapping
        result && result.data
          ? [
              // Creates a tag for each individual chat item, e.g., { type: 'Chat', id: '123' }
              ...result.data.map(({ _id }) => ({ type: "Chat" as const, id: _id })),
              // Also provides a general list tag, useful for invalidating the whole list on creation
              { type: "Chat", id: "LIST" },
            ]
          : // If there's no result or no data, just provide the list tag
            [{ type: "Chat", id: "LIST" }],
    }),


    addMessage: builder.mutation<
      AddMessageResponse,
      { chatId: string; query: string }
    >({
      query: ({ chatId, query }) => ({
        url: `/content/chat/${chatId}`,
        method: "POST",
        body: { query },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Chat", id: chatId },
        { type: "Chat", id: "LIST" },
      ],
    }),

    deleteChat: builder.mutation<DeleteChatResponse, string>({
      query: (chatId) => ({
        url: `/chat/${chatId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
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
  useSearchPineconeMutation,
  useRagMutation,
  // Exported chat hooks
  useCreateChatMutation,
  useGetChatQuery,
  useGetAllChatsQuery,
  useAddMessageMutation,
  useDeleteChatMutation,
} = api;