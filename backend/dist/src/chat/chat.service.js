"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMessage = exports.getAllChats = exports.deleteChat = exports.getChat = exports.createChat = void 0;
const chat_schema_1 = require("./chat.schema");
const chat_schema_2 = require("./chat.schema");
const createChat = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = new chat_schema_1.Chat({
        userId,
        lastActive: new Date(),
    });
    const savedChat = yield chat.save();
    return savedChat;
});
exports.createChat = createChat;
const getChat = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_schema_1.Chat.findOne({ _id: chatId, userId }).populate('messages');
    if (!chat)
        throw new Error("Chat not found or does not belong to user");
    return chat;
});
exports.getChat = getChat;
const deleteChat = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_schema_1.Chat.findOneAndDelete({ _id: chatId, userId });
    if (!chat)
        throw new Error("Chat not found or does not belong to user");
    return chat;
});
exports.deleteChat = deleteChat;
const getAllChats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = yield chat_schema_1.Chat.find({ userId }).populate('messages');
    return chats;
});
exports.getAllChats = getAllChats;
const addMessage = (chatId, role, message, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chatExists = yield chat_schema_1.Chat.findOne({ _id: chatId, userId });
    if (!chatExists)
        throw new Error("Chat not found or does not belong to user");
    const newMessage = new chat_schema_2.Message({
        role,
        message
    });
    yield newMessage.save();
    chatExists.messages.push(newMessage._id);
    yield chatExists.save();
    return chatExists;
});
exports.addMessage = addMessage;
