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
const getEmbeddings = (text) => __awaiter(void 0, void 0, void 0, function* () {
    // Load embedding pipeline
    const extractor = yield (0, transformers_1.pipeline)('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const output = yield extractor(text, {
        pooling: 'mean',
        normalize: true,
    });
    return output.data;
});
exports.getEmbeddings = getEmbeddings;
