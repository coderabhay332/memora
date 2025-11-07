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
exports.getEmbeddings = void 0;
const transformers_1 = require("@xenova/transformers");
// Optimize memory usage for transformers
transformers_1.env.allowLocalModels = false;
transformers_1.env.allowRemoteModels = true;
transformers_1.env.useBrowserCache = false;
transformers_1.env.useCustomCache = false;
// Cache the model pipeline to avoid reloading on every call
let cachedExtractor = null;
const getEmbeddings = (text, userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Load model only once and cache it
    if (!cachedExtractor) {
        console.log('[EMBEDDINGS] Loading model...');
        cachedExtractor = yield (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('[EMBEDDINGS] Model loaded and cached');
    }
    const output = yield cachedExtractor(text, {
        pooling: 'mean',
        normalize: true,
    });
    console.log('[EMBEDDINGS] Output:', output.data);
    return output.data;
});
exports.getEmbeddings = getEmbeddings;
