import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { Message, Chat } from '../../../chat/chat.schema';
import { me } from '../../../user/user.service';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const MAX_TOKENS = 4096; // Adjust based on your model's limits

export const askGemini = async (userId: string, chatId: string | null, context: string, query: string) => {
  // Input validation
  if (!query?.trim()) throw new Error("Query cannot be empty");
  if (!context?.trim()) console.warn("Context is empty"); // Warning instead of error

  // Get or create chat
  let chat;
  if (chatId) {
    chat = await Chat.findById(chatId);
    if (!chat) throw new Error("Chat not found");
  } else {
    chat = await Chat.create({
      userId,
      title: query.slice(0, 30) // First 30 chars as title
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

  // Process with Gemini (your existing logic)
  const trimmedContext = context.length > MAX_TOKENS * 4 
    ? context.slice(-MAX_TOKENS * 4) 
    : context;

  const prompt = `[CONTEXT]: ${trimmedContext}\n[QUESTION]: ${query}\n[ANSWER]:`;
  
  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const answer = response.text();

    if (!answer) throw new Error("Empty response from Gemini");

    // Save assistant response
    const assistantMessage = await Message.create({
      role: 'assistant',
      message: answer
    });

    chat.messages.push(assistantMessage._id);
    await chat.save();

    return {
      answer,
      chatId: chat._id, // Return chat ID for client
      newChat: !chatId // Flag if new chat was created
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