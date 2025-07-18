export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ContentResponse {
  data: ContentItem[];
  message: string;
  success: boolean;
}