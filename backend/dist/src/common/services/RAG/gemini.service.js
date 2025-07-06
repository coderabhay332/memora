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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGemini = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const chat_schema_1 = require("../../../chat/chat.schema");
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const MAX_TOKENS = 4096; // Adjust based on your model's limits
const askGemini = (userId, chatId, context, query) => __awaiter(void 0, void 0, void 0, function* () {
    // Input validation
    if (!(query === null || query === void 0 ? void 0 : query.trim()))
        throw new Error("Query cannot be empty");
    if (!(context === null || context === void 0 ? void 0 : context.trim()))
        console.warn("Context is empty"); // Warning instead of error
    // Get or create chat
    let chat;
    if (chatId) {
        chat = yield chat_schema_1.Chat.findById(chatId);
        if (!chat)
            throw new Error("Chat not found");
    }
    else {
        chat = yield chat_schema_1.Chat.create({
            userId,
            title: query.slice(0, 30) // First 30 chars as title
        });
    }
    // Create user message
    const userMessage = yield chat_schema_1.Message.create({
        role: 'user',
        message: query
    });
    // Add message to chat
    chat.messages.push(userMessage._id);
    chat.lastActive = new Date();
    yield chat.save();
    // Process with Gemini (your existing logic)
    const trimmedContext = context.length > MAX_TOKENS * 4
        ? context.slice(-MAX_TOKENS * 4)
        : context;
    const prompt = `[CONTEXT]: ${trimmedContext}\n[QUESTION]: ${query}\n[ANSWER]:`;
    try {
        const result = yield model.generateContent([prompt]);
        const response = yield result.response;
        const answer = response.text();
        if (!answer)
            throw new Error("Empty response from Gemini");
        // Save assistant response
        const assistantMessage = yield chat_schema_1.Message.create({
            role: 'assistant',
            message: answer
        });
        chat.messages.push(assistantMessage._id);
        yield chat.save();
        return {
            answer,
            chatId: chat._id, // Return chat ID for client
            newChat: !chatId // Flag if new chat was created
        };
    }
    catch (error) {
        console.error("Gemini error:", error);
        // Save error message for debugging
        yield chat_schema_1.Message.create({
            role: 'assistant',
            message: `ERROR: ${error.message}`
        });
        throw error; // Re-throw for client handling
    }
});
exports.askGemini = askGemini;
