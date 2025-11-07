"use strict";
/**
 * Enhanced RAG Service with improved context processing and relevance scoring
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextOptimizer = exports.EnhancedRAGService = void 0;
const prompt_templates_1 = require("./prompt-templates");
class EnhancedRAGService {
    /**
     * Process and optimize context for better RAG performance
     */
    static processContext(rawContext_1, query_1) {
        return __awaiter(this, arguments, void 0, function* (rawContext, query, config = {}) {
            const finalConfig = Object.assign(Object.assign({}, this.DEFAULT_CONFIG), config);
            // Extract key terms from query for relevance scoring
            const keyTerms = prompt_templates_1.PromptOptimizer.extractKeyTerms(query);
            // Split context into chunks with overlap
            const chunks = this.createContextChunks(rawContext, finalConfig);
            // Score chunks for relevance
            const scoredChunks = finalConfig.useRelevanceScoring
                ? this.scoreChunkRelevance(chunks, keyTerms, query)
                : chunks.map(chunk => (Object.assign(Object.assign({}, chunk), { relevanceScore: 1.0 })));
            // Filter by relevance score
            const relevantChunks = scoredChunks.filter(chunk => chunk.relevanceScore >= finalConfig.minRelevanceScore);
            // Sort by relevance score
            relevantChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);
            // Optimize context length
            const optimizedContext = this.optimizeContextLength(relevantChunks, finalConfig.maxContextLength);
            return {
                optimizedContext,
                chunks: relevantChunks,
            };
        });
    }
    /**
     * Create context chunks with overlap for better continuity
     */
    static createContextChunks(context, config) {
        const chunkSize = Math.floor(config.maxContextLength * 0.3); // 30% of max length per chunk
        const overlapSize = Math.floor(chunkSize * config.contextOverlap);
        const chunks = [];
        let start = 0;
        let chunkIndex = 0;
        while (start < context.length) {
            const end = Math.min(start + chunkSize, context.length);
            const content = context.slice(start, end);
            // Try to break at sentence boundaries
            const sentenceEnd = content.lastIndexOf('.');
            const finalEnd = sentenceEnd > start + chunkSize * 0.7 ? sentenceEnd + 1 : end;
            chunks.push({
                content: context.slice(start, finalEnd),
                relevanceScore: 0, // Will be calculated later
                sourceId: `chunk_${chunkIndex}`,
                metadata: {
                    startPosition: start,
                    endPosition: finalEnd,
                    chunkIndex,
                },
            });
            start = finalEnd - overlapSize;
            chunkIndex++;
        }
        return chunks;
    }
    /**
     * Score chunks based on relevance to the query
     */
    static scoreChunkRelevance(chunks, keyTerms, query) {
        return chunks.map(chunk => {
            let relevanceScore = 0;
            // Score based on key term matches
            keyTerms.forEach(term => {
                const termMatches = (chunk.content.toLowerCase().match(new RegExp(term, 'g')) || []).length;
                relevanceScore += termMatches * 0.3; // Weight for term matches
            });
            // Score based on query word matches
            const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
            queryWords.forEach(word => {
                const wordMatches = (chunk.content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
                relevanceScore += wordMatches * 0.2; // Weight for query word matches
            });
            // Normalize score (0-1)
            const maxPossibleScore = keyTerms.length * 0.3 + queryWords.length * 0.2;
            relevanceScore = Math.min(relevanceScore / maxPossibleScore, 1.0);
            return Object.assign(Object.assign({}, chunk), { relevanceScore });
        });
    }
    /**
     * Optimize context length while preserving most relevant content
     */
    static optimizeContextLength(chunks, maxLength) {
        let optimizedContext = '';
        let currentLength = 0;
        for (const chunk of chunks) {
            if (currentLength + chunk.content.length <= maxLength) {
                optimizedContext += chunk.content + '\n\n';
                currentLength += chunk.content.length + 2; // +2 for newlines
            }
            else {
                // If we can't fit the whole chunk, try to fit a portion
                const remainingSpace = maxLength - currentLength;
                if (remainingSpace > 100) { // Only if we have meaningful space left
                    const truncatedContent = chunk.content.slice(0, remainingSpace - 10);
                    optimizedContext += truncatedContent + '...';
                }
                break;
            }
        }
        return optimizedContext.trim();
    }
    /**
     * Generate specialized prompts based on content type and query intent
     */
    static generateSpecializedPrompt(context_1, query_1, contentType_1) {
        return __awaiter(this, arguments, void 0, function* (context, query, contentType, config = {}) {
            const finalConfig = Object.assign(Object.assign({}, this.DEFAULT_CONFIG), config);
            // Process context first
            const { optimizedContext } = yield this.processContext(context, query, finalConfig);
            // Generate specialized prompt based on content type
            const specializedPrompts = {
                document: 'qa',
                conversation: 'creative',
                technical: 'analysis',
                creative: 'creative',
            };
            return prompt_templates_1.PromptTemplates.generateSpecializedPrompt(specializedPrompts[contentType], optimizedContext, query, {
                maxContextLength: finalConfig.maxContextLength,
                includeInstructions: true,
                responseStyle: 'detailed',
                includeSourceReferences: true,
            });
        });
    }
    /**
     * Analyze query intent for better prompt selection
     */
    static analyzeQueryIntent(query) {
        const lowerQuery = query.toLowerCase();
        // Determine intent
        let intent = 'question';
        if (lowerQuery.includes('summarize') || lowerQuery.includes('summary')) {
            intent = 'summary';
        }
        else if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis')) {
            intent = 'analysis';
        }
        else if (lowerQuery.includes('compare') || lowerQuery.includes('versus') || lowerQuery.includes('vs')) {
            intent = 'comparison';
        }
        else if (lowerQuery.includes('create') || lowerQuery.includes('generate') || lowerQuery.includes('write')) {
            intent = 'creative';
        }
        // Determine complexity
        const complexity = prompt_templates_1.PromptOptimizer.calculateOptimalContextLength(query, 1000) > 2000 ? 'complex' : 'simple';
        // Determine if context is required
        const requiresContext = !lowerQuery.includes('hello') && !lowerQuery.includes('hi') && query.length > 3;
        return { intent, complexity, requiresContext };
    }
}
exports.EnhancedRAGService = EnhancedRAGService;
EnhancedRAGService.DEFAULT_CONFIG = {
    maxContextLength: 4000,
    minRelevanceScore: 0.3,
    includeMetadata: true,
    useRelevanceScoring: true,
    contextOverlap: 0.1, // 10% overlap
};
/**
 * Context optimization utilities
 */
class ContextOptimizer {
    /**
     * Remove redundant information from context
     */
    static deduplicateContext(context) {
        const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const uniqueSentences = new Set();
        const deduplicatedSentences = [];
        sentences.forEach(sentence => {
            const normalized = sentence.trim().toLowerCase();
            if (!uniqueSentences.has(normalized)) {
                uniqueSentences.add(normalized);
                deduplicatedSentences.push(sentence.trim());
            }
        });
        return deduplicatedSentences.join('. ') + '.';
    }
    /**
     * Extract key information from context
     */
    static extractKeyInformation(context, maxLength = 1000) {
        const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 0);
        // Score sentences by information density
        const scoredSentences = sentences.map(sentence => {
            const words = sentence.split(/\s+/).length;
            const uniqueWords = new Set(sentence.toLowerCase().split(/\s+/)).size;
            const density = uniqueWords / words;
            return {
                sentence,
                score: density * words, // Favor longer, more diverse sentences
            };
        });
        // Sort by score and take top sentences
        scoredSentences.sort((a, b) => b.score - a.score);
        let result = '';
        for (const { sentence } of scoredSentences) {
            if (result.length + sentence.length <= maxLength) {
                result += sentence + '. ';
            }
            else {
                break;
            }
        }
        return result.trim();
    }
}
exports.ContextOptimizer = ContextOptimizer;
