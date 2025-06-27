// pineconeService.ts
import index from './pinecone.config';

interface PineconeVectorInput {
  id: string; 
  values: number[]; 
  metadata?: Record<string, any>; 
}

export const upsertToPinecone = async (vectors: PineconeVectorInput[]) => {
  try {
    // Validate vectors before upsert
    if (!vectors || vectors.length === 0) {
      console.warn("No vectors provided for upsert");
      return;
    }

    // Log first vector for debugging
    console.log("First vector being upserted:", {
      id: vectors[0].id,
      valuesLength: vectors[0].values?.length,
      metadata: vectors[0].metadata
    });

    // Perform the upsert
    const upsertResponse = await index.upsert(vectors);
    console.log(`✅ Successfully upserted ${vectors.length} vectors to Pinecone`);
    return upsertResponse;
  } catch (error) {
    console.error("❌ Failed to upsert to Pinecone:", {
      error: error instanceof Error ? error.message : error,
      vectorsCount: vectors?.length,
      sampleVector: vectors?.[0] ? {
        id: vectors[0].id,
        valuesLength: vectors[0].values?.length,
        metadataKeys: vectors[0].metadata ? Object.keys(vectors[0].metadata) : null
      } : null
    });
    throw error;
  }
};
