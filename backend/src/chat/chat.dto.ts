import { BaseSchema } from "../common/dto/base.dto";

export interface IChat extends BaseSchema {
    userId: string;
    messages: IMessage[];
    title: string;
    lastActive: Date;
}

export interface IMessage extends BaseSchema {
    chatId: string;
    senderId: string;
    role: "user" | "assistant";
    message: string;
    contentId?: string | null;
    sourceInfo?: Record<string, any> | null;
    attribution?: string | null;
    contextStats?: Record<string, any> | null;
}

