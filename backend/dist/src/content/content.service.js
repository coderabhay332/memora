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
exports.deleteContent = exports.updateContent = exports.getContentById = exports.getAllContent = exports.createContent = void 0;
const content_schema_1 = __importDefault(require("./content.schema"));
const user_schema_1 = __importDefault(require("../user/user.schema"));
const rabbitmq_service_1 = require("../common/services/rabbitmq.service");
const createContent = (content, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findById(userId);
    console.log("user", user);
    if (!user)
        throw new Error("User not found");
    const newContent = new content_schema_1.default({
        content,
    });
    yield newContent.save();
    user.content.push(newContent.id);
    yield user.save();
    return newContent;
});
exports.createContent = createContent;
const getAllContent = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("userId", userId);
    const user = yield user_schema_1.default.findById(userId).populate('content');
    if (!user)
        throw new Error("User not found");
    return user.content;
});
exports.getAllContent = getAllContent;
const getContentById = (contentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield content_schema_1.default.findById(contentId);
    if (!content)
        throw new Error("Content not found");
    return content;
});
exports.getContentById = getContentById;
const updateContent = (contentId, content, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findById(userId);
    if (!user)
        throw new Error("User not found");
    const updatedContent = yield content_schema_1.default.findByIdAndUpdate(contentId, { content }, { new: true });
    if (!updatedContent)
        throw new Error("Content not found");
    const channel = (0, rabbitmq_service_1.getChannel)();
    if (!channel) {
        console.error("Failed to get channel");
        return updatedContent;
    }
    channel.sendToQueue('embedding_jobs', Buffer.from(JSON.stringify({ contentId: updatedContent._id, userId })));
    channel.close();
    return updatedContent;
});
exports.updateContent = updateContent;
const deleteContent = (contentId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findById(userId);
    if (!user)
        throw new Error("User not found");
    const deletedContent = yield content_schema_1.default.findByIdAndDelete(contentId);
    if (!deletedContent)
        throw new Error("Content not found");
    return deletedContent;
});
exports.deleteContent = deleteContent;
