"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const pinecone_1 = require("@pinecone-database/pinecone");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pc = new pinecone_1.Pinecone({
    apiKey: (_a = process.env.PINECONE_API_KEY) !== null && _a !== void 0 ? _a : "",
});
const indexName = (_b = process.env.PINECONE_INDEX_NAME) !== null && _b !== void 0 ? _b : "test-index";
const index = pc.Index(indexName);
exports.default = index;
