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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.embeddings = exports.extract = exports.login = exports.createUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const response_helper_1 = require("../common/helper/response.helper");
const passport_jwt_services_1 = require("../common/services/passport-jwt.services");
const userService = __importStar(require("./user.service"));
const medium_1 = __importDefault(require("../common/services/extractor/medium"));
const linkdin_twiiter_1 = __importDefault(require("../common/services/extractor/linkdin&twiiter"));
const generic_1 = require("../common/services/extractor/generic");
const embeddings_1 = require("../common/services/embeddings/embeddings");
const pineconeService_1 = require("../common/services/pinecone/pineconeService");
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
    const links = text.match(urlRegex) || [];
    const taggedLinks = links.map((link) => {
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
    const processLinks = (links, extractorFn) => __awaiter(void 0, void 0, void 0, function* () {
        return yield Promise.all(links.map((link, index) => __awaiter(void 0, void 0, void 0, function* () {
            const content = yield extractorFn(link.url);
            const actualText = typeof content === 'string' ? content : (content === null || content === void 0 ? void 0 : content.content) || (content === null || content === void 0 ? void 0 : content.text) || '';
            const embedding = yield (0, embeddings_1.getEmbeddings)(actualText);
            // Push to Pinecone
            yield (0, pineconeService_1.upsertToPinecone)([{
                    id: `doc-${Date.now()}-${index}`,
                    values: Array.from(embedding),
                    metadata: {
                        url: link.url,
                        tag: link.tag,
                        content: actualText,
                    },
                }]);
            return {
                url: link.url,
                content: actualText,
                embedding,
                tag: link.tag,
            };
        })));
    });
    const mediumEmbeds = yield processLinks(taggedLinks.filter((l) => l.tag === 'medium'), medium_1.default);
    const linkedinEmbeds = yield processLinks(taggedLinks.filter((l) => l.tag === 'linkedin'), linkdin_twiiter_1.default);
    const twitterEmbeds = yield processLinks(taggedLinks.filter((l) => l.tag === 'twitter'), linkdin_twiiter_1.default);
    const genericEmbeds = yield processLinks(taggedLinks.filter((l) => l.tag === 'generic'), generic_1.extractGenericContent);
    const allResults = [...mediumEmbeds, ...linkedinEmbeds, ...twitterEmbeds, ...genericEmbeds];
    res.status(200).json({
        count: allResults.length,
        results: allResults,
    });
}));
exports.embeddings = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { text } = req.body;
    const embedding = yield (0, embeddings_1.getEmbeddings)(text);
    res.status(200).json({
        embedding
    });
}));
