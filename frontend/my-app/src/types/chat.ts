export interface IMessage {
  _id: string;
  chatId: string;
  senderId: string;
  role: "user" | "assistant";
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChat {
  _id: string;
  userId: string;
  messages: IMessage[];
  title: string;
  lastActive: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateChatResponse {
  success: boolean;
  data: IChat;
}

export interface GetChatResponse {
  success: boolean;
  data: IChat;
}

export interface AddMessageRequest {
  role: "user" | "assistant";
  message: string;
}

export interface AddMessageResponse {
  success: boolean;
  data: IChat;
}

export interface DeleteChatResponse {
  success: boolean;
  data: IChat;
}
