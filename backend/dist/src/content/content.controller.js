"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.deleteContent = exports.updateContent = exports.getRAGSource = exports.getContentById = exports.getAllContent = exports.createContent = exports.rag = exports.searchPinecone = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_helper_1 = require("../common/helper/response.helper");
const pinecone_config_1 = __importDefault(require("../common/services/pinecone/pinecone.config"));
const contentService = __importStar(require("./content.service"));
const embeddings_1 = require("../common/services/embeddings/embeddings");
const gemini_service_1 = require("../common/services/RAG/gemini.service");
const rabbitmq_service_1 = require("../common/services/rabbitmq.service");
const source_info_service_1 = require("../common/services/RAG/source-info.service");
const chat_schema_1 = require("../chat/chat.schema");
exports.searchPinecone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    const queryVector = yield (0, embeddings_1.getEmbeddings)(req.body.query, userId);
    const results = yield pinecone_config_1.default.query({
        vector: Array.from(queryVector),
        topK: 5,
        includeMetadata: true,
        filter: {
            userId: req.body.userId, // Filter by user ID if provided
        }
    });
    res.send((0, response_helper_1.createResponse)(results, "Search results retrieved successfully"));
}));
const search = (queryVector, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield pinecone_config_1.default.query({
        vector: Array.from(queryVector),
        topK: 5,
        includeMetadata: true,
        filter: {
            userId: userId,
        }
    });
    return results;
});
const chunkText = (text, chunkSize = 2000) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
};
exports.rag = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { id } = req.params;
    console.log("chatId", id);
    if (!id || typeof id !== 'string') {
        res.status(400).send((0, response_helper_1.createResponse)(null, "Chat ID is required"));
        return;
    }
    const query = req.body.query;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!query || !userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "Query and User ID are required"));
        return;
    }
    try {
        let optimizedContext = '';
        let contentId = '';
        let queryAnalysis = { intent: 'question', complexity: 'simple' };
        let rawContextLength = 0;
        let relevantChunksCount = 0;
        // Always use embeddings for RAG
        const queryEmbeddings = yield (0, embeddings_1.getEmbeddings)(req.body.query, userId);
        const results = yield search(Array.from(queryEmbeddings), userId);
        console.log("results", results);
        // Check if we have relevant matches with good similarity scores
        const MIN_RELEVANCE_SCORE = 0.5; // Minimum similarity score threshold
        const MIN_CONTEXT_LENGTH = 50; // Minimum context length to be considered meaningful
        const topMatch = (_b = results.matches) === null || _b === void 0 ? void 0 : _b[0];
        const hasRelevantMatch = topMatch && topMatch.score && topMatch.score >= MIN_RELEVANCE_SCORE;
        const contentIdRaw = hasRelevantMatch ? (_c = topMatch.metadata) === null || _c === void 0 ? void 0 : _c.contentId : null;
        contentId = contentIdRaw ? String(contentIdRaw) : '';
        // Extract raw context from search results - simplified to avoid memory issues
        // Check both 'content' (for URL-extracted) and 'contentSnippet' (for manual input)
        const rawContext = ((_d = results.matches) === null || _d === void 0 ? void 0 : _d.slice(0, 3).map(r => { var _a, _b; return ((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.content) || ((_b = r.metadata) === null || _b === void 0 ? void 0 : _b.contentSnippet) || ''; }).filter(c => c).join('\n\n').slice(0, 4000)) || '';
        console.log("📝 Extracted context length:", rawContext.length, "characters");
        console.log("📊 Top match score:", (topMatch === null || topMatch === void 0 ? void 0 : topMatch.score) || 'N/A');
        // Only consider context valid if it meets minimum requirements
        const hasValidContext = rawContext.length >= MIN_CONTEXT_LENGTH && hasRelevantMatch;
        if (rawContext.length > 0) {
            console.log("📝 Context preview:", rawContext.substring(0, 200));
        }
        else {
            console.warn("⚠️ No context extracted from search results");
        }
        if (!hasValidContext) {
            console.log("⚠️ Context doesn't meet relevance threshold - will not return contentId");
            contentId = ''; // Clear contentId if context is not relevant
        }
        // Simple query analysis without heavy processing
        queryAnalysis = {
            intent: query.includes('?') ? 'question' : 'summary',
            complexity: query.length > 50 ? 'medium' : 'simple',
            requiresContext: true
        };
        console.log("Query analysis:", queryAnalysis);
        // Use raw context directly - skip heavy processing to save memory
        optimizedContext = rawContext;
        rawContextLength = rawContext.length;
        relevantChunksCount = ((_e = results.matches) === null || _e === void 0 ? void 0 : _e.length) || 0;
        const contentIdToPass = hasValidContext ? contentId : '';
        const ragResponse = yield (0, gemini_service_1.askGemini)(userId, id, optimizedContext, query, contentIdToPass);
        // Only fetch source info if we have a valid contentId
        const finalContentId = ragResponse.contentId || '';
        const sourceInfo = finalContentId
            ? yield source_info_service_1.SourceInfoService.getSourceInfo(finalContentId, userId)
            : null;
        // Get content preview for better context
        const contentPreview = finalContentId && sourceInfo
            ? yield source_info_service_1.SourceInfoService.getContentPreview(finalContentId, userId, 300)
            : null;
        const enrichedSourceInfo = sourceInfo
            ? Object.assign(Object.assign({}, sourceInfo), { preview: contentPreview !== null && contentPreview !== void 0 ? contentPreview : null }) : null;
        const attribution = sourceInfo ? source_info_service_1.SourceInfoService.createAttributionText([sourceInfo]) : null;
        const contextStatsPayload = {
            originalLength: rawContextLength,
            optimizedLength: optimizedContext.length,
            relevantChunks: relevantChunksCount,
            queryIntent: queryAnalysis.intent,
            queryComplexity: queryAnalysis.complexity,
        };
        if (ragResponse.messageId) {
            yield chat_schema_1.Message.findByIdAndUpdate(ragResponse.messageId, {
                $set: {
                    contentId: finalContentId || null,
                    sourceInfo: enrichedSourceInfo,
                    attribution,
                    contextStats: contextStatsPayload,
                },
            }).catch((error) => {
                console.error('Failed to enrich assistant message with source metadata:', error);
            });
        }
        res.send((0, response_helper_1.createResponse)({
            answer: ragResponse.answer,
            contentId: finalContentId,
            chatId: ragResponse.chatId,
            sourceInfo: enrichedSourceInfo,
            attribution,
            contextStats: contextStatsPayload,
        }, "Enhanced RAG response generated successfully"));
    }
    catch (error) {
        console.error("RAG processing error:", error);
        res.status(500).send((0, response_helper_1.createResponse)(null, "Failed to process RAG request"));
    }
}));
exports.createContent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    try {
        const result = yield contentService.createContent(req.body.content, userId);
        // Send to RabbitMQ queue with improved error handling
        if ((0, rabbitmq_service_1.isRabbitMQConnected)()) {
            try {
                yield (0, rabbitmq_service_1.sendToQueue)('embedding_jobs', Buffer.from(JSON.stringify({ contentId: result._id, userId })));
                console.log(`📤 Sent embedding job for content ${result._id}`);
            }
            catch (queueError) {
                console.error('❌ Failed to send embedding job to queue:', queueError);
                // Don't fail the request if queue is unavailable
            }
        }
        else {
            console.warn('⚠️ RabbitMQ not connected, embedding job will be queued when connection is restored');
        }
        res.send((0, response_helper_1.createResponse)(result, "Content created successfully"));
    }
    catch (error) {
        console.error('❌ Error creating content:', error);
        res.status(500).send((0, response_helper_1.createResponse)(null, "Failed to create content"));
    }
}));
exports.getAllContent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    const result = yield contentService.getAllContent(userId);
    res.send((0, response_helper_1.createResponse)(result, "All content fetched successfully"));
}));
exports.getContentById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    const result = yield contentService.getContentById(req.params.id, userId);
    res.send((0, response_helper_1.createResponse)(result, "Content fetched successfully"));
}));
// New endpoint for RAG source navigation
exports.getRAGSource = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    const { contentId } = req.params;
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    if (!contentId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "Content ID is required"));
        return;
    }
    try {
        // Get detailed source information
        const sourceInfo = yield source_info_service_1.SourceInfoService.getSourceInfo(contentId, userId);
        if (!sourceInfo) {
            res.status(404).send((0, response_helper_1.createResponse)(null, "Content not found or access denied"));
            return;
        }
        // Get full content for the source
        const fullContent = yield contentService.getContentById(contentId, userId);
        res.send((0, response_helper_1.createResponse)({
            sourceInfo,
            fullContent,
            navigationUrl: `/content/${contentId}`,
            canEdit: true, // User can edit their own content
            canDelete: true
        }, "RAG source information retrieved successfully"));
    }
    catch (error) {
        console.error("Error fetching RAG source:", error);
        res.status(500).send((0, response_helper_1.createResponse)(null, "Failed to fetch source information"));
    }
}));
exports.updateContent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    const result = yield contentService.updateContent(req.params.id, req.body.content, userId);
    res.send((0, response_helper_1.createResponse)(result, "Content updated successfully"));
}));
exports.deleteContent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    try {
        const result = yield contentService.deleteContent(req.params.id, userId);
        if (!result) {
            res.status(404).send((0, response_helper_1.createResponse)(null, "Content not found"));
            return;
        }
        // Send delete job to RabbitMQ queue with improved error handling
        if ((0, rabbitmq_service_1.isRabbitMQConnected)()) {
            try {
                yield (0, rabbitmq_service_1.sendToQueue)('delete_jobs', Buffer.from(JSON.stringify({ contentId: result._id, userId })));
                console.log(`📤 Sent delete job for content ${result._id}`);
            }
            catch (queueError) {
                console.error('❌ Failed to send delete job to queue:', queueError);
                // Don't fail the request if queue is unavailable
            }
        }
        else {
            console.warn('⚠️ RabbitMQ not connected, delete job will be queued when connection is restored');
        }
        res.send((0, response_helper_1.createResponse)(result, "Content deleted successfully"));
    }
    catch (error) {
        console.error('❌ Error deleting content:', error);
        res.status(500).send((0, response_helper_1.createResponse)(null, "Failed to delete content"));
    }
}));
