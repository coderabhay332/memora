import { pipeline, env } from '@xenova/transformers';
import dotenv from 'dotenv';

dotenv.config();

(env as any).HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN;

const MAX_INPUT_TOKENS = 1024; // based on model

// Simple approximation: limit characters assuming 1 token ≈ 4 chars
const truncatePrompt = (text: string, maxTokens = MAX_INPUT_TOKENS) => {
  const approxChars = maxTokens * 4;
  return text.length > approxChars ? text.slice(-approxChars) : text;
};

export const rag = async (context: string, query: string) => {
  const generator = await pipeline('text-generation', 'Xenova/distilgpt2');

  const rawPrompt = `Context:\n${context}\n\nQuestion:\n${query}\n\nAnswer:`;
  const prompt = truncatePrompt(rawPrompt);

  const out = await generator(prompt, {
    max_new_tokens: 150,
    temperature: 0.7,
    do_sample: true,
  });

  return out[0];
};
