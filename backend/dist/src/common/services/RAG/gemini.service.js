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
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const askGemini = (context, query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // ✅ 1. Handle empty inputs
    if (!(query === null || query === void 0 ? void 0 : query.trim()))
        throw new Error("Query cannot be empty.");
    if (!(context === null || context === void 0 ? void 0 : context.trim()))
        throw new Error("Context is empty or missing.");
    const MAX_TOKENS = 30000;
    const approxCharLimit = MAX_TOKENS * 4;
    const trimmedContext = context.length > approxCharLimit
        ? context.slice(-approxCharLimit)
        : context;
    const prompt = `
You are a helpful assistant. Use the following context to answer the question.

Context:
${trimmedContext}

Question:
${query}

Answer:
`;
    try {
        const result = yield model.generateContent([prompt]); // ✅ pass prompt as array
        const response = yield result.response;
        // ✅ 4. Validate response format
        const answer = (_a = response.text) === null || _a === void 0 ? void 0 : _a.call(response);
        if (!answer || typeof answer !== 'string') {
            throw new Error("Invalid response from Gemini.");
        }
        return answer;
    }
    catch (error) {
        // ✅ 3. Handle API/network errors clearly
        console.error("Gemini RAG Error:", error.message);
        return `⚠️ Gemini failed to respond: ${error.message || "Unknown error"}`;
    }
});
exports.askGemini = askGemini;
