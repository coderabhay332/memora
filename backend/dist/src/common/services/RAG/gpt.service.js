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
exports.askOpenAI = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize OpenAI client with error handling
let openai;
try {
    openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
}
catch (error) {
    throw new Error('Failed to initialize OpenAI client. Please check your API key.');
}
// Token calculation helper (approximate)
const countTokensApprox = (text) => {
    return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
};
const askOpenAI = (context, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    // ✅ Input validation
    if (!(query === null || query === void 0 ? void 0 : query.trim()))
        throw new Error("Query cannot be empty or whitespace.");
    if (!(context === null || context === void 0 ? void 0 : context.trim()))
        throw new Error("Context cannot be empty or whitespace.");
    // Token management
    const MAX_TOKENS = 128000; // GPT-4-turbo context window
    const SAFETY_BUFFER = 1000; // Reserve tokens for response
    const contextTokenCount = countTokensApprox(context);
    const queryTokenCount = countTokensApprox(query);
    // Warn if context is too large
    if (contextTokenCount > MAX_TOKENS - SAFETY_BUFFER) {
        console.warn(`⚠️ Context is too large (${contextTokenCount} tokens). Trimming...`);
    }
    // Calculate max context we can send
    const maxContextTokens = MAX_TOKENS - SAFETY_BUFFER - queryTokenCount;
    const effectiveContext = contextTokenCount > maxContextTokens
        ? context.slice(-maxContextTokens * 4) // Approximate character count
        : context;
    const messages = [
        {
            role: 'system',
            content: `You are a helpful assistant. Use the provided context to answer the question. 
                If the answer isn't in the context, say "I couldn't find that information."`,
        },
        {
            role: 'user',
            content: `Context:\n${effectiveContext}\n\nQuestion: ${query}`,
        },
    ];
    try {
        const startTime = Date.now();
        const response = yield openai.chat.completions.create({
            model: 'gpt-4-turbo-preview', // Latest GPT-4-turbo
            messages,
            temperature: 0.7,
            max_tokens: 1000, // Limit response length
        });
        const answer = (_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim();
        if (!answer) {
            throw new Error("Received empty response from OpenAI.");
        }
        console.log(`✅ OpenAI response in ${Date.now() - startTime}ms`);
        return {
            answer,
            tokensUsed: (_d = response.usage) === null || _d === void 0 ? void 0 : _d.total_tokens,
            modelUsed: response.model,
        };
    }
    catch (error) {
        console.error("OpenAI API Error:", {
            message: error.message,
            code: error.code,
            status: error.status,
        });
        // Handle rate limits specifically
        if (error.status === 429) {
            return {
                answer: "⚠️ OpenAI is currently rate limited. Please try again later.",
            };
        }
        // Handle authentication errors
        if (error.status === 401) {
            return {
                answer: "⚠️ OpenAI authentication failed. Please check your API key.",
            };
        }
        return {
            answer: `⚠️ Sorry, I couldn't process your request. ${error.message || "Please try again."}`,
        };
    }
});
exports.askOpenAI = askOpenAI;
