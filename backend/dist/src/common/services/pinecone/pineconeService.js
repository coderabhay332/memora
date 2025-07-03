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
exports.upsertToPinecone = exports.deleteFromPinecone = void 0;
// pineconeService.ts
const pinecone_config_1 = __importDefault(require("./pinecone.config"));
const deleteFromPinecone = (contentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Debug: Check index stats
        const indexDescription = yield pinecone_config_1.default.describeIndexStats();
        console.log("Index capabilities:", indexDescription);
        // Correct filter syntax for Pinecone
        yield pinecone_config_1.default.deleteMany({
            contentId: contentId // Simple equality test (alternative syntax)
        });
        console.log(`✅ Successfully deleted vectors for contentId: ${contentId}`);
    }
    catch (error) {
        console.error(`❌ Error deleting vectors for contentId ${contentId}:`, error);
        throw error;
    }
});
exports.deleteFromPinecone = deleteFromPinecone;
const upsertToPinecone = (vectors) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // Validate vectors before upsert
        const stats = yield pinecone_config_1.default.describeIndexStats();
        console.log("Full Index Stats:", JSON.stringify(stats, null, 2));
        // More detailed inspection
        console.log("Does index exist?", stats.dimension ? "Yes" : "No");
        console.log("Index dimension:", stats.dimension);
        console.log("Namespaces:", Object.keys(stats.namespaces || {}));
        if (!vectors || vectors.length === 0) {
            console.warn("No vectors provided for upsert");
            return;
        }
        // Log first vector for debugging
        console.log("First vector being upserted:", {
            id: vectors[0].id,
            valuesLength: (_a = vectors[0].values) === null || _a === void 0 ? void 0 : _a.length,
            metadata: vectors[0].metadata
        });
        // Perform the upsert
        const upsertResponse = yield pinecone_config_1.default.upsert(vectors);
        console.log(`✅ Successfully upserted ${vectors.length} vectors to Pinecone`);
        return upsertResponse;
    }
    catch (error) {
        console.error("❌ Failed to upsert to Pinecone:", {
            error: error instanceof Error ? error.message : error,
            vectorsCount: vectors === null || vectors === void 0 ? void 0 : vectors.length,
            sampleVector: (vectors === null || vectors === void 0 ? void 0 : vectors[0]) ? {
                id: vectors[0].id,
                valuesLength: (_b = vectors[0].values) === null || _b === void 0 ? void 0 : _b.length,
                metadataKeys: vectors[0].metadata ? Object.keys(vectors[0].metadata) : null
            } : null
        });
        throw error;
    }
});
exports.upsertToPinecone = upsertToPinecone;
