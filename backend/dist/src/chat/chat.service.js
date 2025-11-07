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
    console.log("[CHAT_SERVICE][createChat] userId=", userId);
    const start = Date.now();
    const chat = new chat_schema_1.Chat({
        userId,
        lastActive: new Date(),
    });
    const savedChat = yield chat.save();
    // Create a starter message from the assistant
    const starterMessage = new chat_schema_2.Message({
        role: "assistant",
        message: "Hello! How can I help you today? Feel free to ask me anything, and I'll do my best to assist you."
    });
    yield starterMessage.save();
    savedChat.messages.push(starterMessage._id);
    yield savedChat.save();
    console.log("[CHAT_SERVICE][createChat] created chatId=", savedChat === null || savedChat === void 0 ? void 0 : savedChat._id, " with starter message in ", Date.now() - start, "ms");
    return savedChat;
});
exports.createChat = createChat;
const getChat = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("[CHAT_SERVICE][getChat] chatId=", chatId, " userId=", userId);
    const start = Date.now();
    const chat = yield chat_schema_1.Chat.findOne({ _id: chatId, userId }).populate('messages');
    console.log("[CHAT_SERVICE][getChat] found=", !!chat, " messages=", (_b = (_a = chat === null || chat === void 0 ? void 0 : chat.messages) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0, " in ", Date.now() - start, "ms");
    if (!chat)
        throw new Error("Chat not found or does not belong to user");
    return chat;
});
exports.getChat = getChat;
const deleteChat = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("[CHAT_SERVICE][deleteChat] chatId=", chatId, " userId=", userId);
    const start = Date.now();
    const chat = yield chat_schema_1.Chat.findOneAndDelete({ _id: chatId, userId });
    console.log("[CHAT_SERVICE][deleteChat] deleted=", !!chat, " in ", Date.now() - start, "ms");
    if (!chat)
        throw new Error("Chat not found or does not belong to user");
    return chat;
});
exports.deleteChat = deleteChat;
const getAllChats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("[CHAT_SERVICE][getAllChats] userId=", userId);
    const start = Date.now();
    const chats = yield chat_schema_1.Chat.find({ userId }).populate('messages');
    console.log("[CHAT_SERVICE][getAllChats] count=", (_a = chats === null || chats === void 0 ? void 0 : chats.length) !== null && _a !== void 0 ? _a : 0, " in ", Date.now() - start, "ms");
    return chats;
});
exports.getAllChats = getAllChats;
const addMessage = (chatId, role, message, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("[CHAT_SERVICE][addMessage] chatId=", chatId, " role=", role, " userId=", userId);
    const start = Date.now();
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
    console.log("[CHAT_SERVICE][addMessage] newMessageId=", newMessage === null || newMessage === void 0 ? void 0 : newMessage._id, " totalMessages=", (_b = (_a = chatExists === null || chatExists === void 0 ? void 0 : chatExists.messages) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0, " in ", Date.now() - start, "ms");
    return chatExists;
});
exports.addMessage = addMessage;
