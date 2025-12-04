"use strict";
/**
 * Source Information Service
 * Handles source content details and linking for RAG responses
 */
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
exports.SourceInfoService = void 0;
const content_schema_1 = __importDefault(require("../../../content/content.schema"));
class SourceInfoService {
    /**
     * Get detailed source information for a content ID
     */
    static getSourceInfo(contentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const content = yield content_schema_1.default.findOne({
                    _id: contentId,
                    userId
                }).select('content createdAt updatedAt');
                if (!content) {
                    return null;
                }
                return {
                    contentId: content._id.toString(),
                    title: 'Content',
                    sourceUrl: `/content/${content._id}`,
                    sourceType: 'content',
                    metadata: {
                        createdAt: content.createdAt,
                        updatedAt: content.updatedAt,
                        contentLength: ((_a = content.content) === null || _a === void 0 ? void 0 : _a.length) || 0
                    }
                };
            }
            catch (error) {
                console.error('Error fetching source info:', error);
                return null;
            }
        });
    }
    /**
     * Get source information for multiple content IDs
     */
    static getMultiSourceInfo(contentIds, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sources = yield Promise.all(contentIds.map(id => this.getSourceInfo(id, userId)));
                const validSources = sources.filter(source => source !== null);
                if (validSources.length === 0) {
                    return null;
                }
                return {
                    primarySource: validSources[0],
                    additionalSources: validSources.slice(1),
                    totalSources: validSources.length
                };
            }
            catch (error) {
                console.error('Error fetching multi-source info:', error);
                return null;
            }
        });
    }
    /**
     * Generate source links for frontend
     */
    static generateSourceLinks(sources) {
        return sources.map(source => ({
            id: source.contentId,
            title: source.title || 'Untitled',
            url: source.sourceUrl,
            type: source.sourceType,
            metadata: source.metadata
        }));
    }
    /**
     * Create source attribution text
     */
    static createAttributionText(sources) {
        if (sources.length === 0)
            return '';
        if (sources.length === 1) {
            return `Source: ${sources[0].title || 'Content'}`;
        }
        const primarySource = sources[0];
        const additionalCount = sources.length - 1;
        return `Primary source: ${primarySource.title || 'Content'}${additionalCount > 0 ? ` (+${additionalCount} additional sources)` : ''}`;
    }
    /**
     * Validate content access for user
     */
    static validateContentAccess(contentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield content_schema_1.default.findOne({
                    _id: contentId,
                    userId
                }).select('_id');
                return content !== null;
            }
            catch (error) {
                console.error('Error validating content access:', error);
                return false;
            }
        });
    }
    /**
     * Get content preview for source linking
     */
    static getContentPreview(contentId_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (contentId, userId, maxLength = 200) {
            try {
                const content = yield content_schema_1.default.findOne({
                    _id: contentId,
                    userId
                }).select('content');
                if (!content || !content.content) {
                    return null;
                }
                const preview = content.content.length > maxLength
                    ? content.content.slice(0, maxLength) + '...'
                    : content.content;
                return preview;
            }
            catch (error) {
                console.error('Error fetching content preview:', error);
                return null;
            }
        });
    }
}
exports.SourceInfoService = SourceInfoService;
