// pineconeService.ts
import index from './pinecone.config';

interface PineconeVectorInput {
  id: string; // unique id for this content
  values: number[]; // the embedding
  metadata?: Record<string, any>; // optional metadata (e.g., url, tag, title)
}

export const upsertToPinecone = async (vectors: PineconeVectorInput[]) => {
  try {
    await index.upsert(vectors);
    console.log("Successfully upserted vectors to Pinecone");
  } catch (error) {
    console.error("Failed to upsert to Pinecone:", error);
    throw error;
  }
};
