import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Message, Chat } from '../../../chat/chat.schema';
import { PromptTemplates, PromptOptimizer } from './prompt-templates';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Normalize and provide fallbacks for model IDs to avoid 404s
function normalizeModelId(raw: string | undefined): string {
  const id = (raw || '').trim();
  if (!id) return 'gemini-2.5-flash'; // Use gemini-2.5-flash as default
  // Remove -latest suffix if present, as it's not always supported
  const cleaned = id.replace(/-latest$/, '');
  // Validate and return valid model names
  if (/^gemini-2\.(0|5)-(flash|pro)(-exp)?$/.test(cleaned)) {
    return cleaned;
  }
  if (/^gemini-1\.5-(flash|pro)$/.test(cleaned)) {
    return cleaned;
  }
  if (/^gemini-(pro|1\.0-pro)$/.test(cleaned)) {
    return cleaned;
  }
  return cleaned || 'gemini-2.5-flash'; // Fallback to gemini-2.5-flash
}

function getModel(id: string) {
  return genAI.getGenerativeModel({ model: id });
}

let PRIMARY_MODEL_ID = normalizeModelId(process.env.GEMINI_GENERATION_MODEL);
let model = getModel(PRIMARY_MODEL_ID);
const MAX_TOKENS = 4096; // Adjust based on your model's limits

/**
 * Clean up repetitive phrases from AI responses
 */
function cleanRepetitivePhrases(text: string): string {
  // Remove common repetitive phrases at the start
  const repetitiveStarters = [
    /^Based on the (provided |given )?context,?\s*/i,
    /^According to the (provided |given )?context,?\s*/i,
    /^Based on the information (provided |given )?(above|below|in the context),?\s*/i,
    /^According to the information (provided |given )?(above|below|in the context),?\s*/i,
    /^From the (provided |given )?context,?\s*/i,
    /^In the (provided |given )?context,?\s*/i,
    /^The (provided |given )?context (indicates|shows|states|says|mentions),?\s*/i,
  ];

  let cleaned = text;
  for (const pattern of repetitiveStarters) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove repetitive phrases in the middle (but keep the content)
  const repetitiveMiddle = [
    /\s*based on the (provided |given )?context,?\s*/gi,
    /\s*according to the (provided |given )?context,?\s*/gi,
    /\s*from the (provided |given )?context,?\s*/gi,
    /\s*in the (provided |given )?context,?\s*/gi,
  ];

  for (const pattern of repetitiveMiddle) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Capitalize first letter if needed
  if (cleaned.length > 0 && cleaned[0] === cleaned[0].toLowerCase()) {
    cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
}

export const askGemini = async (userId: string, chatId: string | null, context: string, query: string, contentId: string) => {
  // Input validation
  if (!query?.trim()) throw new Error("Query cannot be empty");
  if (!context?.trim()) console.warn("Context is empty"); // Warning instead of error

  // Get or create chat
  let chat;
  if (chatId) {
    chat = await Chat.findById(chatId).populate('messages');
    if (!chat) throw new Error("Chat not found");
  } else {
    chat = await Chat.create({
      userId,
      title: query.slice(0, 30) 
    });
  }

  // Create user message
  const userMessage = await Message.create({
    role: 'user',
    message: query
  });

  // Add message to chat
  chat.messages.push(userMessage._id);
  chat.lastActive = new Date();
  await chat.save();

  // Process with Gemini using optimized prompt templates
  const optimalContextLength = PromptOptimizer.calculateOptimalContextLength(query, MAX_TOKENS * 4);
  
  // Get chat history for conversation context
  const chatHistory = chat.messages ? chat.messages.map((msg: any) => ({
    role: msg.role,
    message: msg.message
  })) : [];
  
  // Generate conversation-aware prompt if we have chat history
  let prompt;
  if (chatHistory.length > 1) {
    const conversationPrompt = PromptTemplates.generateConversationPrompt(
      context, 
      query, 
      chatHistory, 
      {
        maxContextLength: optimalContextLength,
        includeInstructions: true,
        responseStyle: 'conversational',
        includeSourceReferences: false, // Don't explicitly reference sources to avoid repetitive phrases
      }
    );
    prompt = conversationPrompt.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
  } else {
    // Generate optimized prompt based on query complexity
    prompt = PromptTemplates.generateGeminiPrompt(context, query, {
      maxContextLength: optimalContextLength,
      includeInstructions: true,
      responseStyle: 'conversational',
      includeSourceReferences: false, // Don't explicitly reference sources to avoid repetitive phrases
    });
  }
  
  try {
    let result;
    try {
      result = await model.generateContent([prompt]);
    } catch (err: any) {
      const msg = String(err?.message || '');
      const is404 = /404|not found/i.test(msg);
      if (is404) {
        // Fallback to supported model names (without -latest suffix)
        const fallbacks = [
          'gemini-2.5-flash',
          'gemini-2.0-flash-exp',
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro'
        ].filter(m => m !== PRIMARY_MODEL_ID);

        for (const fb of fallbacks) {
          try {
            PRIMARY_MODEL_ID = fb;
            model = getModel(fb);
            result = await model.generateContent([prompt]);
            break;
          } catch (e) {
            // try next
          }
        }

        if (!result) throw err; // rethrow original if all fallbacks failed
      } else {
        throw err;
      }
    }
    const response = await result.response;
   
    let answer = response.text();

    if (!answer) throw new Error("Empty response from Gemini");

    // Post-process to remove common repetitive phrases
    answer = cleanRepetitivePhrases(answer);

    // Check if the AI response indicates it doesn't have the information
    const noInfoPhrases = [
      /don'?t have (enough |sufficient |the )?information/i,
      /don'?t know/i,
      /no information (available|provided|found)/i,
      /not (available|found|provided|in the context)/i,
      /unable to (answer|find|determine)/i,
      /cannot (answer|find|determine)/i,
      /insufficient information/i,
      /lack of information/i,
      /context (doesn'?t|does not) (contain|include|have)/i,
    ];

    const indicatesNoInfo = noInfoPhrases.some(phrase => phrase.test(answer));
    
    // Only use contentId if we have context AND the AI doesn't indicate lack of information
    const shouldUseContentId = contentId && context.trim().length > 0 && !indicatesNoInfo;
    const finalContentId = shouldUseContentId ? contentId : null;

    if (indicatesNoInfo && contentId) {
      console.log("⚠️ AI response indicates lack of information - clearing contentId");
    }

    // Save assistant response
    const assistantMessage = await Message.create({
      role: 'assistant',
      message: answer,
      contentId: finalContentId,
    });

    chat.messages.push(assistantMessage._id);
    await chat.save();

    return {
      answer,
      contentId: finalContentId || '', // Return content ID only if we have valid context
      chatId: chat._id, // Return chat ID for client
      messageId: assistantMessage._id,
    };

  } catch (error: any) {
    console.error("Gemini error:", error);
    
    // Save error message for debugging
    await Message.create({
      role: 'assistant',
      message: `ERROR: ${error.message}`
    });

    throw error; // Re-throw for client handling
  }
};