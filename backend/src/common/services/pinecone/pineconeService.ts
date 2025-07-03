// pineconeService.ts
import index from './pinecone.config';

interface PineconeVectorInput {
  id: string; 
  values: number[]; 
  metadata?: Record<string, any>; 
}

export const deleteFromPinecone = async (contentId: string, userId: string) => {
  try {
    // Debug: Check index stats
   const indexDescription = await index.describeIndexStats();
    console.log("Index capabilities:", indexDescription);

    // Correct filter syntax for Pinecone
  await index.deleteMany({ 
 
    contentId: contentId // Simple equality test (alternative syntax)

});
    
    console.log(`✅ Successfully deleted vectors for contentId: ${contentId}`);
  } catch (error) {
    console.error(`❌ Error deleting vectors for contentId ${contentId}:`, error);
    throw error;
  }
};
export const upsertToPinecone = async (vectors: PineconeVectorInput[]) => {
  try {
    // Validate vectors before upsert

     const stats = await index.describeIndexStats();
    console.log("Full Index Stats:", JSON.stringify(stats, null, 2));
    
    // More detailed inspection
    console.log("Does index exist?", stats.dimension ? "Yes" : "No");
    console.log("Index dimension:", stats.dimension);
    console.log("Namespaces:", Object.keys(stats.namespaces || {}));


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
