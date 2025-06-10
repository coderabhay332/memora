import { pipeline } from '@xenova/transformers';



const getEmbeddings = async (text: string) => {
    // Load embedding pipeline
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const output = await extractor(text, {
        pooling: 'mean', 
        normalize: true,  
    });
    return output.data;
}

export { getEmbeddings };
