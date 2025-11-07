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
const prompt_templates_1 = require("./prompt-templates");
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Normalize and provide fallbacks for model IDs to avoid 404s
function normalizeModelId(raw) {
    const id = (raw || '').trim();
    if (!id)
        return 'gemini-2.5-flash'; // Use gemini-2.5-flash as default
    // Remove -latest suffix if present, as it's not always supported
    const cleaned = id.replace(/-latest$/, '');
    // Validate and return valid model names
    if (/^gemini-2\.(0|5)-(flash|pro)(-exp)?$/.test(cleaned)) {
        return cleaned;
    }
    if (/^gemini-1\.5-(flash|pro)$/.test(cleaned)) {
        return cleaned;
    }
    if (/^gemini-(pro|1\.0-pro)$/.test(cleaned)) {
        return cleaned;
    }
    return cleaned || 'gemini-2.5-flash'; // Fallback to gemini-2.5-flash
}
function getModel(id) {
    return genAI.getGenerativeModel({ model: id });
}
let PRIMARY_MODEL_ID = normalizeModelId(process.env.GEMINI_GENERATION_MODEL);
let model = getModel(PRIMARY_MODEL_ID);
const MAX_TOKENS = 4096; // Adjust based on your model's limits
/**
 * Clean up repetitive phrases from AI responses
 */
function cleanRepetitivePhrases(text) {
    // Remove common repetitive phrases at the start
    const repetitiveStarters = [
        /^Based on the (provided |given )?context,?\s*/i,
        /^According to the (provided |given )?context,?\s*/i,
        /^Based on the information (provided |given )?(above|below|in the context),?\s*/i,
        /^According to the information (provided |given )?(above|below|in the context),?\s*/i,
        /^From the (provided |given )?context,?\s*/i,
        /^In the (provided |given )?context,?\s*/i,
        /^The (provided |given )?context (indicates|shows|states|says|mentions),?\s*/i,
    ];
    let cleaned = text;
    for (const pattern of repetitiveStarters) {
        cleaned = cleaned.replace(pattern, '');
    }
    // Remove repetitive phrases in the middle (but keep the content)
    const repetitiveMiddle = [
        /\s*based on the (provided |given )?context,?\s*/gi,
        /\s*according to the (provided |given )?context,?\s*/gi,
        /\s*from the (provided |given )?context,?\s*/gi,
        /\s*in the (provided |given )?context,?\s*/gi,
    ];
    for (const pattern of repetitiveMiddle) {
        cleaned = cleaned.replace(pattern, ' ');
    }
    // Clean up multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    // Capitalize first letter if needed
    if (cleaned.length > 0 && cleaned[0] === cleaned[0].toLowerCase()) {
        cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
    }
    return cleaned;
}
const askGemini = (userId, chatId, context, query, contentId) => __awaiter(void 0, void 0, void 0, function* () {
    // Input validation
    if (!(query === null || query === void 0 ? void 0 : query.trim()))
        throw new Error("Query cannot be empty");
    if (!(context === null || context === void 0 ? void 0 : context.trim()))
        console.warn("Context is empty"); // Warning instead of error
    // Get or create chat
    let chat;
    if (chatId) {
        chat = yield chat_schema_1.Chat.findById(chatId).populate('messages');
        if (!chat)
            throw new Error("Chat not found");
    }
    else {
        chat = yield chat_schema_1.Chat.create({
            userId,
            title: query.slice(0, 30)
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
    // Process with Gemini using optimized prompt templates
    const optimalContextLength = prompt_templates_1.PromptOptimizer.calculateOptimalContextLength(query, MAX_TOKENS * 4);
    // Get chat history for conversation context
    const chatHistory = chat.messages ? chat.messages.map((msg) => ({
        role: msg.role,
        message: msg.message
    })) : [];
    // Generate conversation-aware prompt if we have chat history
    let prompt;
    if (chatHistory.length > 1) {
        const conversationPrompt = prompt_templates_1.PromptTemplates.generateConversationPrompt(context, query, chatHistory, {
            maxContextLength: optimalContextLength,
            includeInstructions: true,
            responseStyle: 'conversational',
            includeSourceReferences: false, // Don't explicitly reference sources to avoid repetitive phrases
        });
        prompt = conversationPrompt.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    }
    else {
        // Generate optimized prompt based on query complexity
        prompt = prompt_templates_1.PromptTemplates.generateGeminiPrompt(context, query, {
            maxContextLength: optimalContextLength,
            includeInstructions: true,
            responseStyle: 'conversational',
            includeSourceReferences: false, // Don't explicitly reference sources to avoid repetitive phrases
        });
    }
    try {
        let result;
        try {
            result = yield model.generateContent([prompt]);
        }
        catch (err) {
            const msg = String((err === null || err === void 0 ? void 0 : err.message) || '');
            const is404 = /404|not found/i.test(msg);
            if (is404) {
                // Fallback to supported model names (without -latest suffix)
                const fallbacks = [
                    'gemini-2.5-flash',
                    'gemini-2.0-flash-exp',
                    'gemini-1.5-flash',
                    'gemini-1.5-pro',
                    'gemini-pro'
                ].filter(m => m !== PRIMARY_MODEL_ID);
                for (const fb of fallbacks) {
                    try {
                        PRIMARY_MODEL_ID = fb;
                        model = getModel(fb);
                        result = yield model.generateContent([prompt]);
                        break;
                    }
                    catch (e) {
                        // try next
                    }
                }
                if (!result)
                    throw err; // rethrow original if all fallbacks failed
            }
            else {
                throw err;
            }
        }
        const response = yield result.response;
        let answer = response.text();
        if (!answer)
            throw new Error("Empty response from Gemini");
        // Post-process to remove common repetitive phrases
        answer = cleanRepetitivePhrases(answer);
        // Check if the AI response indicates it doesn't have the information
        const noInfoPhrases = [
            /don'?t have (enough |sufficient |the )?information/i,
            /don'?t know/i,
            /no information (available|provided|found)/i,
            /not (available|found|provided|in the context)/i,
            /unable to (answer|find|determine)/i,
            /cannot (answer|find|determine)/i,
            /insufficient information/i,
            /lack of information/i,
            /context (doesn'?t|does not) (contain|include|have)/i,
        ];
        const indicatesNoInfo = noInfoPhrases.some(phrase => phrase.test(answer));
        // Only use contentId if we have context AND the AI doesn't indicate lack of information
        const shouldUseContentId = contentId && context.trim().length > 0 && !indicatesNoInfo;
        const finalContentId = shouldUseContentId ? contentId : null;
        if (indicatesNoInfo && contentId) {
            console.log("⚠️ AI response indicates lack of information - clearing contentId");
        }
        // Save assistant response
        const assistantMessage = yield chat_schema_1.Message.create({
            role: 'assistant',
            message: answer,
            contentId: finalContentId,
        });
        chat.messages.push(assistantMessage._id);
        yield chat.save();
        return {
            answer,
            contentId: finalContentId || '', // Return content ID only if we have valid context
            chatId: chat._id, // Return chat ID for client
            messageId: assistantMessage._id,
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
