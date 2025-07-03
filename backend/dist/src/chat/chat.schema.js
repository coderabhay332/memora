"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.Message = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    role: { type: String, enum: ["user", "assistant"], required: true },
    message: { type: String, required: true },
}, { timestamps: true });
exports.Message = mongoose_1.default.model("Message", messageSchema);
const chatSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Chat" },
    messages: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Message" }],
    lastActive: { type: Date, default: Date.now },
}, { timestamps: true });
exports.Chat = mongoose_1.default.model("Chat", chatSchema);
