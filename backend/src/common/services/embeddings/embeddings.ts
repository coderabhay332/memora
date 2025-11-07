import { pipeline, env } from '@xenova/transformers';

// Optimize memory usage for transformers
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = false;
env.useCustomCache = false;

// Cache the model pipeline to avoid reloading on every call
let cachedExtractor: any = null;

const getEmbeddings = async (text: string, userId: string) => {
    // Load model only once and cache it
    if (!cachedExtractor) {
        console.log('[EMBEDDINGS] Loading model...');
        cachedExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log('[EMBEDDINGS] Model loaded and cached');
    }

    const output = await cachedExtractor(text, {
        pooling: 'mean', 
        normalize: true,  
    });
    console.log('[EMBEDDINGS] Output:', output.data);
    return output.data;
}

export { getEmbeddings };