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
const axios_1 = __importDefault(require("axios"));
function extractContentWithMicrolink(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.get(`https://api.microlink.io?url=${encodeURIComponent(url)}&audio=true&video=true&meta=true`);
        const { data } = res;
        if (data.status === 'success') {
            return {
                title: data.data.title,
                description: data.data.description,
                content: data.data.textContent || data.data.description || '',
                image: (_a = data.data.image) === null || _a === void 0 ? void 0 : _a.url,
                publisher: data.data.publisher,
            };
        }
        throw new Error('Failed to extract content');
    });
}
