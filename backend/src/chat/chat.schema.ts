import { BaseSchema } from "../common/dto/base.dto";

export interface IChat extends BaseSchema {
    userId: string;
    messages: IMessage[];
}

export interface IMessage extends BaseSchema {
    senderId: string;
    content: string;
    timestamp: Date;
}

export interface ISession extends BaseSchema {
    userId: string;
    chatId: string;
    lastActive: Date;
}