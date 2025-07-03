import OpenAI from 'openai';
import dotenv from 'dotenv';
import { ChatCompletionMessageParam } from 'openai/resources';

dotenv.config();

// Initialize OpenAI client with error handling
let openai: OpenAI;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  throw new Error('Failed to initialize OpenAI client. Please check your API key.');
}

// Type for the function response
type OpenAIResponse = {
  answer: string;
  tokensUsed?: number;
  modelUsed?: string;
};

// Token calculation helper (approximate)
const countTokensApprox = (text: string): number => {
  return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
};

export const askOpenAI = async (context: string, query: string): Promise<OpenAIResponse> => {
  // ✅ Input validation
  if (!query?.trim()) throw new Error("Query cannot be empty or whitespace.");
  if (!context?.trim()) throw new Error("Context cannot be empty or whitespace.");

  // Token management
  const MAX_TOKENS = 128000; // GPT-4-turbo context window
  const SAFETY_BUFFER = 1000; // Reserve tokens for response
  const contextTokenCount = countTokensApprox(context);
  const queryTokenCount = countTokensApprox(query);

  // Warn if context is too large
  if (contextTokenCount > MAX_TOKENS - SAFETY_BUFFER) {
    console.warn(`⚠️ Context is too large (${contextTokenCount} tokens). Trimming...`);
  }

  // Calculate max context we can send
  const maxContextTokens = MAX_TOKENS - SAFETY_BUFFER - queryTokenCount;
  const effectiveContext = contextTokenCount > maxContextTokens
    ? context.slice(-maxContextTokens * 4) // Approximate character count
    : context;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a helpful assistant. Use the provided context to answer the question. 
                If the answer isn't in the context, say "I couldn't find that information."`,
    },
    {
      role: 'user',
      content: `Context:\n${effectiveContext}\n\nQuestion: ${query}`,
    },
  ];

  try {
    const startTime = Date.now();
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Latest GPT-4-turbo
      messages,
      temperature: 0.7,
      max_tokens: 1000, // Limit response length
    });

    const answer = response.choices[0]?.message?.content?.trim();
    if (!answer) {
      throw new Error("Received empty response from OpenAI.");
    }

    console.log(`✅ OpenAI response in ${Date.now() - startTime}ms`);

    return {
      answer,
      tokensUsed: response.usage?.total_tokens,
      modelUsed: response.model,
    };
  } catch (error: any) {
    console.error("OpenAI API Error:", {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    // Handle rate limits specifically
    if (error.status === 429) {
      return {
        answer: "⚠️ OpenAI is currently rate limited. Please try again later.",
      };
    }

    // Handle authentication errors
    if (error.status === 401) {
      return {
        answer: "⚠️ OpenAI authentication failed. Please check your API key.",
      };
    }

    return {
      answer: `⚠️ Sorry, I couldn't process your request. ${error.message || "Please try again."}`,
    };
  }
};