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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rag = exports.searchPinecone = exports.extract = exports.login = exports.createUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_helper_1 = require("../common/helper/response.helper");
const passport_jwt_services_1 = require("../common/services/passport-jwt.services");
const userService = __importStar(require("./user.service"));
const pinecone_config_1 = __importDefault(require("../common/services/pinecone/pinecone.config"));
const medium_1 = __importDefault(require("../common/services/extractor/medium"));
const linkdin_twiiter_1 = __importDefault(require("../common/services/extractor/linkdin&twiiter"));
const generic_1 = require("../common/services/extractor/generic");
const pineconeService_1 = require("../common/services/pinecone/pineconeService");
const embeddings_1 = require("../common/services/embeddings/embeddings");
const idGenerator_service_1 = require("../common/services/idGenerator.service");
const gemini_service_1 = require("../common/services/RAG/gemini.service");
exports.createUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name } = req.body;
    const result = yield userService.createUser(req.body);
    const { password } = result, user = __rest(result, ["password"]);
    res.send((0, response_helper_1.createResponse)(user, "User created successfully"));
}));
exports.login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const tokens = (0, passport_jwt_services_1.createUserTokens)(user);
    res.send((0, response_helper_1.createResponse)(Object.assign(Object.assign({}, tokens), { user: {
            id: user._id,
            email: user.email,
            role: user.role,
        } })));
}));
exports.extract = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const text = req.body.text || '';
    const user = req.user;
    const links = text.match(urlRegex) || [];
    const cleanText = text.replace(urlRegex, '').replace(/\s+/g, ' ').trim();
    console.log("extract called with text:", cleanText, "and links:", links);
    // Validate and tag links
    const validLinks = links.filter((link) => {
        try {
            new URL(link);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
    const taggedLinks = validLinks.map((link) => {
        const domain = new URL(link).hostname;
        let tag;
        if (domain.includes("x.com") || domain.includes("twitter.com"))
            tag = "twitter";
        else if (domain.includes("medium.com"))
            tag = "medium";
        else if (domain.includes("linkedin.com"))
            tag = "linkedin";
        else
            tag = "generic";
        return { url: link, tag };
    });
    const extractorMap = {
        medium: medium_1.default,
        linkedin: linkdin_twiiter_1.default,
        twitter: linkdin_twiiter_1.default,
        generic: generic_1.extractGenericContent,
    };
    const processLinks = (links) => __awaiter(void 0, void 0, void 0, function* () {
        return yield Promise.all(links.map((link) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const extractorFn = extractorMap[link.tag] || generic_1.extractGenericContent;
                const content = yield extractorFn(link.url);
                const actualText = typeof content === 'string' ? content : (content === null || content === void 0 ? void 0 : content.content) || (content === null || content === void 0 ? void 0 : content.text) || '';
                if (!actualText)
                    throw new Error('No content found.');
                const chunks = chunkText(actualText.trim(), 1000);
                const vectors = [];
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i];
                    const chunkId = (0, idGenerator_service_1.generateDeterministicId)(`${link.url}|${i}`);
                    const fetched = yield pinecone_config_1.default.fetch([chunkId]);
                    if (fetched.records[chunkId]) {
                        console.log(`🔁 Skipping existing chunk: ${chunkId}`);
                        continue;
                    }
                    const embedding = yield (0, embeddings_1.getEmbeddings)(chunk);
                    vectors.push({
                        id: chunkId,
                        values: Array.from(embedding),
                        metadata: {
                            url: link.url,
                            tag: link.tag,
                            chunkIndex: i,
                            content: chunk,
                            createdAt: new Date().toISOString(),
                        },
                    });
                }
                if (vectors.length > 0) {
                    const validVectors = vectors.filter(v => v.values !== undefined);
                    yield (0, pineconeService_1.upsertToPinecone)(validVectors);
                }
                return {
                    url: link.url,
                    chunks: vectors.length,
                    success: true,
                    skipped: false,
                };
            }
            catch (error) {
                console.error(`Error processing ${link.url}:`, error);
                return {
                    url: link.url,
                    chunks: 0,
                    success: false,
                    error: error.message,
                };
            }
        })));
    });
    // 🟡 Process links if present
    let allResults = [];
    if (taggedLinks.length > 0) {
        allResults = yield processLinks(taggedLinks);
    }
    // 🟢 Process clean text even if no links exist
    if (cleanText) {
        const cleanChunks = chunkText(cleanText, 1000);
        const vectors = [];
        for (let i = 0; i < cleanChunks.length; i++) {
            const chunk = cleanChunks[i];
            const chunkId = (0, idGenerator_service_1.generateDeterministicId)(cleanText + i);
            console.log(chunkId, chunk);
            const fetched = yield pinecone_config_1.default.fetch([chunkId]);
            if (fetched.records && fetched.records[chunkId]) {
                console.log(`🔁 Skipping existing text chunk: ${chunkId}`);
                continue;
            }
            const embedding = yield (0, embeddings_1.getEmbeddings)(chunk);
            vectors.push({
                id: chunkId,
                values: Array.from(embedding),
                metadata: {
                    tag: 'manual-input',
                    content: chunk, // Use actual user ID instead of "demo"
                    chunkIndex: i,
                    createdAt: new Date().toISOString(),
                },
            });
        }
        if (vectors.length > 0) {
            // Filter out any vectors without values and cast to required type
            const validVectors = vectors.filter(v => v.values && v.values.length > 0);
            if (validVectors.length > 0) {
                yield (0, pineconeService_1.upsertToPinecone)(validVectors);
                console.log(`✅ Successfully upserted ${validVectors.length} manual text chunks`);
            }
            else {
                console.log('⚠️ No valid vectors to upsert for manual text');
            }
        }
        allResults.push({
            source: 'manual-text',
            chunks: vectors.length,
            success: vectors.length > 0,
            skipped: false,
        });
    } // 🧾 Final Response
    res.status(200).json({
        count: allResults.length,
        successful: allResults.filter(r => r.success).length,
        failed: allResults.filter(r => !r.success).length,
        results: allResults,
    });
}));
exports.searchPinecone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const queryVector = yield (0, embeddings_1.getEmbeddings)(req.body.query);
    const results = yield pinecone_config_1.default.query({
        vector: Array.from(queryVector),
        topK: 5,
        includeMetadata: true,
    });
    res.status(200).json(results);
}));
const search = (queryVector) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield pinecone_config_1.default.query({
        vector: Array.from(queryVector),
        topK: 5,
        includeMetadata: true,
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
    var _a;
    const query = req.body.query;
    const queryEmbeddings = yield (0, embeddings_1.getEmbeddings)(req.body.query);
    const contextResults = yield search(Array.from(queryEmbeddings));
    const results = yield search(Array.from(queryEmbeddings));
    const context = ((_a = results.matches) === null || _a === void 0 ? void 0 : _a.map(r => { var _a; return (_a = r.metadata) === null || _a === void 0 ? void 0 : _a.content; }).join('\n\n')) || '';
    const answer = yield (0, gemini_service_1.askGemini)(context, query);
    res.status(200).json({ answer });
}));
