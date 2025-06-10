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
exports.upsertToPinecone = void 0;
// pineconeService.ts
const pinecone_config_1 = __importDefault(require("./pinecone.config"));
const upsertToPinecone = (vectors) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pinecone_config_1.default.upsert(vectors);
        console.log("Successfully upserted vectors to Pinecone");
    }
    catch (error) {
        console.error("Failed to upsert to Pinecone:", error);
        throw error;
    }
});
exports.upsertToPinecone = upsertToPinecone;
