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
exports.rag = void 0;
const transformers_1 = require("@xenova/transformers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
transformers_1.env.HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN;
const MAX_INPUT_TOKENS = 1024; // based on model
// Simple approximation: limit characters assuming 1 token ≈ 4 chars
const truncatePrompt = (text, maxTokens = MAX_INPUT_TOKENS) => {
    const approxChars = maxTokens * 4;
    return text.length > approxChars ? text.slice(-approxChars) : text;
};
const rag = (context, query) => __awaiter(void 0, void 0, void 0, function* () {
    const generator = yield (0, transformers_1.pipeline)('text-generation', 'Xenova/distilgpt2');
    const rawPrompt = `Context:\n${context}\n\nQuestion:\n${query}\n\nAnswer:`;
    const prompt = truncatePrompt(rawPrompt);
    const out = yield generator(prompt, {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
    });
    return out[0];
});
exports.rag = rag;
