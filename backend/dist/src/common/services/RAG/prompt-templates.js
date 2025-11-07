"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptOptimizer = exports.PromptTemplates = void 0;
class PromptTemplates {
    /**
     * Generate optimized prompt for Gemini
     */
    static generateGeminiPrompt(context, query, config = {}) {
        const finalConfig = Object.assign(Object.assign({}, this.DEFAULT_CONFIG), config);
        const trimmedContext = this.trimContext(context, finalConfig.maxContextLength);
        const instructions = finalConfig.includeInstructions
            ? this.getGeminiInstructions(finalConfig)
            : '';
        // Use varied prompt structures to avoid repetitive responses
        const promptVariations = [
            `${instructions}

Here's some information that might help:

${trimmedContext}

Now, answer this question naturally: ${query}`,
            `${instructions}

Information:
${trimmedContext}

Question: ${query}

Provide a natural, direct answer:`,
            `${instructions}

Relevant information:
${trimmedContext}

User asks: ${query}

Your response:`
        ];
        // Select variation based on query hash for variety
        const variationIndex = query.length % promptVariations.length;
        return promptVariations[variationIndex];
    }
    static generateGPTPrompt(context, query, config = {}) {
        const finalConfig = Object.assign(Object.assign({}, this.DEFAULT_CONFIG), config);
        const trimmedContext = this.trimContext(context, finalConfig.maxContextLength);
        const promptVariations = [
            {
                system: this.getGPTSystemPrompt(finalConfig),
                user: `Information:
${trimmedContext}

Question: ${query}

Answer naturally:`
            },
            {
                system: this.getGPTSystemPrompt(finalConfig),
                user: `Here's what I know:

${trimmedContext}

${query}`
            },
            {
                system: this.getGPTSystemPrompt(finalConfig),
                user: `Relevant details:
${trimmedContext}

User asks: ${query}

Your response:`
            }
        ];
        const variationIndex = query.length % promptVariations.length;
        return promptVariations[variationIndex];
    }
    /**
     * Generate conversation-aware prompt with chat history
     */
    static generateConversationPrompt(context, query, chatHistory, config = {}) {
        const finalConfig = Object.assign(Object.assign({}, this.DEFAULT_CONFIG), config);
        const trimmedContext = this.trimContext(context, finalConfig.maxContextLength);
        const messages = [
            {
                role: 'system',
                content: this.getGPTSystemPrompt(finalConfig),
            },
        ];
        // Add recent chat history (last 5 messages to avoid token overflow)
        const recentHistory = chatHistory.slice(-5);
        recentHistory.forEach((msg) => {
            messages.push({
                role: msg.role,
                content: msg.message,
            });
        });
        // Add current context and query with natural phrasing
        const contextPrompts = [
            `Here's some relevant information:

${trimmedContext}

${query}

Answer naturally, considering our conversation so far.`,
            `Information:
${trimmedContext}

Question: ${query}

Provide a helpful answer that continues our conversation naturally.`,
            `Context:
${trimmedContext}

User asks: ${query}

Respond naturally:`
        ];
        const promptIndex = query.length % contextPrompts.length;
        messages.push({
            role: 'user',
            content: contextPrompts[promptIndex],
        });
        return {
            system: this.getGPTSystemPrompt(finalConfig),
            messages,
        };
    }
    /**
     * Smart context trimming with relevance preservation
     */
    static trimContext(context, maxLength) {
        if (context.length <= maxLength)
            return context;
        // Try to preserve complete sentences
        const trimmed = context.slice(-maxLength);
        const firstSentenceIndex = trimmed.indexOf('.');
        if (firstSentenceIndex > 0 && firstSentenceIndex < maxLength * 0.1) {
            return trimmed.slice(firstSentenceIndex + 1);
        }
        return trimmed;
    }
    static getGeminiInstructions(config) {
        const responseStyleGuide = {
            concise: 'Give brief, to-the-point answers without unnecessary elaboration.',
            detailed: 'Provide comprehensive answers with relevant details and examples.',
            conversational: 'Respond naturally as if having a friendly conversation, using a warm and approachable tone.'
        };
        const baseInstructions = `You are a helpful assistant answering questions using the information provided below.

IMPORTANT GUIDELINES:
- Answer directly and naturally - start with the answer, not with phrases like "based on the context" or "according to the information"
- Be ${config.responseStyle} - ${responseStyleGuide[config.responseStyle]}
- Use the context information naturally in your response without explicitly mentioning it
- If information is missing, simply say you don't have that information
- Write as if you're having a natural conversation
- Avoid repetitive phrases or prefacing every statement`;
        if (config.includeSourceReferences) {
            return baseInstructions + '\n- Weave in relevant details seamlessly without explicitly citing "the context"';
        }
        return baseInstructions;
    }
    static getGPTSystemPrompt(config) {
        const responseStyleGuide = {
            concise: 'Give brief, focused answers.',
            detailed: 'Provide thorough explanations with examples.',
            conversational: 'Use a natural, friendly tone as if chatting with a friend.'
        };
        const basePrompt = `You are a helpful assistant that answers questions using the information provided.

CORE PRINCIPLES:
- Answer directly and naturally - no need to mention "based on the context" or similar phrases
- Be ${config.responseStyle} - ${responseStyleGuide[config.responseStyle]}
- Write as if you naturally know this information
- If you don't have the information, simply say so without explaining why
- Use clear, readable formatting

RESPONSE STYLE:
- Start with the answer immediately
- Integrate information naturally into your response
- Use lists or formatting when helpful
- Avoid repetitive phrases or unnecessary prefacing`;
        if (config.includeSourceReferences) {
            return basePrompt + '\n- Include relevant details naturally without explicitly citing sources';
        }
        return basePrompt;
    }
    /**
     * Generate specialized prompts for different use cases
     */
    static generateSpecializedPrompt(type, context, query, config = {}) {
        const finalConfig = Object.assign(Object.assign({}, this.DEFAULT_CONFIG), config);
        const trimmedContext = this.trimContext(context, finalConfig.maxContextLength);
        const specializedInstructions = {
            summary: 'Provide a concise summary of the key points from the context.',
            analysis: 'Analyze the context and provide insights, patterns, or relationships.',
            qa: 'Answer the question directly based on the context.',
            creative: 'Use the context as inspiration for a creative response.',
        };
        const taskVariations = {
            summary: ['Summarize the key points', 'Give me the main takeaways', 'What are the highlights'],
            analysis: ['Analyze this', 'What insights can you provide', 'Break this down'],
            qa: ['Answer this', 'Help with this question', 'What can you tell me'],
            creative: ['Use this as inspiration', 'Create something based on this', 'Build on this idea']
        };
        const taskPhrase = taskVariations[type][query.length % taskVariations[type].length];
        return `${this.getGeminiInstructions(finalConfig)}

Information:
${trimmedContext}

${taskPhrase}: ${query}

Provide a natural ${type} response:`;
    }
}
exports.PromptTemplates = PromptTemplates;
PromptTemplates.DEFAULT_CONFIG = {
    maxContextLength: 4000,
    includeInstructions: true,
    responseStyle: 'detailed',
    includeSourceReferences: true,
};
/**
 * Utility functions for prompt optimization
 */
class PromptOptimizer {
    /**
     * Calculate optimal context length based on query complexity
     */
    static calculateOptimalContextLength(query, maxTokens = 4000) {
        const queryComplexity = this.analyzeQueryComplexity(query);
        const baseLength = Math.floor(maxTokens * 0.8); // Use 80% for context
        // Adjust based on query complexity
        if (queryComplexity === 'simple')
            return Math.floor(baseLength * 0.6);
        if (queryComplexity === 'complex')
            return Math.floor(baseLength * 0.9);
        return baseLength;
    }
    /**
     * Analyze query complexity for better context allocation
     */
    static analyzeQueryComplexity(query) {
        const words = query.split(' ').length;
        const hasMultipleQuestions = (query.match(/\?/g) || []).length > 1;
        const hasComplexTerms = /(analyze|compare|explain|describe|evaluate|assess)/i.test(query);
        if (words < 5 && !hasComplexTerms)
            return 'simple';
        if (words > 15 || hasMultipleQuestions || hasComplexTerms)
            return 'complex';
        return 'medium';
    }
    /**
     * Extract key terms from query for better context relevance
     */
    static extractKeyTerms(query) {
        // Remove common stop words and extract meaningful terms
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'how', 'why', 'when', 'where', 'who']);
        return query
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word))
            .slice(0, 10); // Limit to top 10 terms
    }
}
exports.PromptOptimizer = PromptOptimizer;
