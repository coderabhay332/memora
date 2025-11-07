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
require("dotenv/config");
const embeddings_1 = require("../common/services/embeddings/embeddings");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const provider = (process.env.EMBEDDINGS_PROVIDER || 'xenova').toLowerCase();
        const sample = process.env.EMBEDDINGS_TEST_TEXT || 'Hello, this is a quick embedding sanity check.';
        const userId = 'test-user';
        try {
            const vec = yield (0, embeddings_1.getEmbeddings)(sample, userId);
            const length = (_a = vec === null || vec === void 0 ? void 0 : vec.length) !== null && _a !== void 0 ? _a : 0;
            if (!length) {
                console.error(`[TEST][embeddings] FAILED: provider=${provider} returned empty vector`);
                process.exit(2);
            }
            console.log(`[TEST][embeddings] SUCCESS: provider=${provider} length=${length}`);
            process.exit(0);
        }
        catch (err) {
            console.error(`[TEST][embeddings] ERROR for provider=${provider}:`, (err === null || err === void 0 ? void 0 : err.message) || err);
            process.exit(1);
        }
    });
}
main();
