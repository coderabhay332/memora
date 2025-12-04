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
exports.getAllChats = exports.addMessage = exports.deleteChat = exports.getChat = exports.createChat = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const chatService = __importStar(require("./chat.service"));
exports.createChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    console.log("[CHAT][createChat] userId=", userId);
    console.time("[CHAT][createChat] duration");
    const result = yield chatService.createChat(userId);
    console.timeEnd("[CHAT][createChat] duration");
    console.log("[CHAT][createChat] created chatId=", result === null || result === void 0 ? void 0 : result._id);
    res.status(201).json(result);
}));
exports.getChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = req.user._id;
    console.log("[CHAT][getChat] userId=", userId, " chatId=", req.params.id);
    console.time("[CHAT][getChat] duration");
    const result = yield chatService.getChat(req.params.id, userId);
    console.timeEnd("[CHAT][getChat] duration");
    console.log("[CHAT][getChat] messages=", (_b = (_a = result === null || result === void 0 ? void 0 : result.messages) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
    res.status(200).json(result);
}));
exports.deleteChat = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    console.log("[CHAT][deleteChat] userId=", userId, " chatId=", req.params.id);
    console.time("[CHAT][deleteChat] duration");
    const result = yield chatService.deleteChat(req.params.id, userId);
    console.timeEnd("[CHAT][deleteChat] duration");
    console.log("[CHAT][deleteChat] deleted chatId=", result === null || result === void 0 ? void 0 : result._id);
    res.status(200).json(result);
}));
exports.addMessage = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = req.user._id;
    const { role } = req.body;
    console.log("[CHAT][addMessage] userId=", userId, " chatId=", req.params.id, " role=", role);
    console.time("[CHAT][addMessage] duration");
    const result = yield chatService.addMessage(req.params.id, role, req.body.message, userId);
    console.timeEnd("[CHAT][addMessage] duration");
    console.log("[CHAT][addMessage] total messages=", (_b = (_a = result === null || result === void 0 ? void 0 : result.messages) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0);
    res.status(201).json(result);
}));
exports.getAllChats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    console.log("[CHAT][getAllChats] userId=", userId);
    console.time("[CHAT][getAllChats] duration");
    const result = yield chatService.getAllChats(userId);
    console.timeEnd("[CHAT][getAllChats] duration");
    console.log("[CHAT][getAllChats] count=", Array.isArray(result) ? result.length : 0);
    res.status(200).json(result);
}));
