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
exports.deleteContent = exports.updateContent = exports.getContentById = exports.getAllContent = exports.createContent = exports.rag = exports.searchPinecone = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_helper_1 = require("../common/helper/response.helper");
const pinecone_config_1 = __importDefault(require("../common/services/pinecone/pinecone.config"));
const contentService = __importStar(require("./content.service"));
const embeddings_1 = require("../common/services/embeddings/embeddings");
const gemini_service_1 = require("../common/services/RAG/gemini.service");
const rabbitmq_service_1 = require("../common/services/rabbitmq.service");
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
    var _a, _b;
    const { chatId } = req.params; // Optional chat ID
    console.log("chatId", chatId);
    if (!chatId || typeof chatId !== 'string') {
        res.status(400).send((0, response_helper_1.createResponse)(null, "Chat ID is required"));
        return;
    }
    const query = req.body.query;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!query || !userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "Query and User ID are required"));
        return;
    }
    const queryEmbeddings = yield (0, embeddings_1.getEmbeddings)(req.body.query, userId);
    const contextResults = yield search(Array.from(queryEmbeddings), userId);
    const results = yield search(Array.from(queryEmbeddings), userId);
    const context = ((_b = results.matches) === null || _b === void 0 ? void 0 : _b.map(r => { var _a; return (_a = r.metadata) === null || _a === void 0 ? void 0 : _a.content; }).join('\n\n')) || '';
    const answer = yield (0, gemini_service_1.askGemini)(userId, chatId, context, query);
    res.send((0, response_helper_1.createResponse)({ answer }, "RAG response generated successfully"));
}));
exports.createContent = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    console.log("userId", userId);
    if (!userId) {
        res.status(400).send((0, response_helper_1.createResponse)(null, "User ID is required"));
        return;
    }
    const result = yield contentService.createContent(req.body.content, userId);
    const channel = yield (0, rabbitmq_service_1.getChannel)();
    if (!channel) {
        res.status(500).send((0, response_helper_1.createResponse)(null, "Failed to create RabbitMQ channel"));
        return;
    }
    channel.sendToQueue('embedding_jobs', Buffer.from(JSON.stringify({ contentId: result._id, userId })));
    res.send((0, response_helper_1.createResponse)(result, "Content created successfully"));
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
    const result = yield contentService.deleteContent(req.params.id, userId);
    if (!result) {
        res.status(404).send((0, response_helper_1.createResponse)(null, "Content not found"));
        return;
    }
    const channel = yield (0, rabbitmq_service_1.getChannel)();
    if (!channel) {
        console.error("Failed to get channel");
        return;
    }
    channel.sendToQueue('delete_jobs', Buffer.from(JSON.stringify({ contentId: result._id, userId })));
    res.send((0, response_helper_1.createResponse)(result, "Content deleted successfully"));
}));
