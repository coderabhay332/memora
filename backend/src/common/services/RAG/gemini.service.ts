import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const askGemini = async (context: string, query: string) => {
  // ✅ 1. Handle empty inputs
  if (!query?.trim()) throw new Error("Query cannot be empty.");
  if (!context?.trim()) throw new Error("Context is empty or missing.");

  const MAX_TOKENS = 30000;
  const approxCharLimit = MAX_TOKENS * 4;
  const trimmedContext = context.length > approxCharLimit
    ? context.slice(-approxCharLimit)
    : context;

  const prompt = `
You are a helpful assistant. Use the following context to answer the question.

Context:
${trimmedContext}

Question:
${query}

Answer:
`;

  try {
    const result = await model.generateContent([prompt]); // ✅ pass prompt as array
    const response = await result.response;

    // ✅ 4. Validate response format
    const answer = response.text?.();
    if (!answer || typeof answer !== 'string') {
      throw new Error("Invalid response from Gemini.");
    }

    return answer;
  } catch (error: any) {
    // ✅ 3. Handle API/network errors clearly
    console.error("Gemini RAG Error:", error.message);
    
    return `⚠️ Gemini failed to respond: ${error.message || "Unknown error"}`;
  }
};
