import { response, type Request, type Response } from 'express';
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.helper";
import pinecone  from '../common/services/pinecone/pinecone.config';
import extractMedium from '../common/services/extractor/medium';
import extractContentWithMicrolink from '../common/services/extractor/linkdin&twiiter';
import { extractGenericContent } from '../common/services/extractor/generic';
import { upsertToPinecone } from '../common/services/pinecone/pineconeService';
import { getEmbeddings } from '../common/services/embeddings/embeddings';
import { generateDeterministicId } from '../common/services/idGenerator.service';
import { askGemini } from '../common/services/RAG/gemini.service';
type PineconeRecord = {
  id: string;
  values?: number[];
  text?: string;
  metadata?: Record<string, any>;
};



export const extract = asyncHandler(async (req: Request, res: Response) => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const text = req.body.text || '';
 

  const links = text.match(urlRegex) || [];
  const cleanText = text.replace(urlRegex, '').replace(/\s+/g, ' ').trim();
  console.log("extract called with text:", cleanText, "and links:", links);

  // Validate and tag links
  const validLinks = links.filter((link: string) => {
    try {
      new URL(link);
      return true;
    } catch {
      return false;
    }
  });

  const taggedLinks = validLinks.map((link: string) => {
    const domain = new URL(link).hostname;
    let tag: string;

    if (domain.includes("x.com") || domain.includes("twitter.com")) tag = "twitter";
    else if (domain.includes("medium.com")) tag = "medium";
    else if (domain.includes("linkedin.com")) tag = "linkedin";
    else tag = "generic";

    res.send(createResponse({ url: link, tag }, "Link tagged successfully"));
    return
  });

  const extractorMap: Record<string, (url: string) => Promise<any>> = {
    medium: extractMedium,
    linkedin: extractContentWithMicrolink,
    twitter: extractContentWithMicrolink,
    generic: extractGenericContent,
  };

  const processLinks = async (links: Array<{ url: string; tag: string }>) => {
    return await Promise.all(
      links.map(async (link) => {
        try {
          const extractorFn = extractorMap[link.tag] || extractGenericContent;
          const content = await extractorFn(link.url);
          const actualText = typeof content === 'string' ? content : content?.content || content?.text || '';

          if (!actualText) throw new Error('No content found.');

          const chunks = chunkText(actualText.trim(), 1000);
          const vectors: PineconeRecord[] = [];

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const chunkId = generateDeterministicId(`${link.url}|${i}`);

            const fetched = await pinecone.fetch([chunkId]);
            if (fetched.records[chunkId]) {
              console.log(`🔁 Skipping existing chunk: ${chunkId}`);
              continue;
            }

            const embedding = await getEmbeddings(chunk);

            vectors.push({
              id: chunkId,
              values: Array.from(embedding),
              metadata: {
                url: link.url,
                tag: link.tag,
                chunkIndex: i,
                content: chunk,
                createdAt: new Date().toISOString(),
              },
            });
          }

          if (vectors.length > 0) {
            const validVectors = vectors.filter(v => v.values !== undefined) as Required<typeof vectors[number]>[];
            await upsertToPinecone(validVectors);
          }

          return {
            url: link.url,
            chunks: vectors.length,
            success: true,
            skipped: false,
          };
        } catch (error: any) {
          console.error(`Error processing ${link.url}:`, error);
          return {
            url: link.url,
            chunks: 0,
            success: false,
            error: error.message,
          };
        }
      })
    );
  };

  // 🟡 Process links if present
  let allResults: any[] = [];
  if (taggedLinks.length > 0) {
    allResults = await processLinks(taggedLinks);
  }

  // 🟢 Process clean text even if no links exist
  if (cleanText) {
  const cleanChunks = chunkText(cleanText, 1000);
  const vectors: PineconeRecord[] = [];

  for (let i = 0; i < cleanChunks.length; i++) {
    const chunk = cleanChunks[i];
    const chunkId = generateDeterministicId(cleanText + i);
    console.log(chunkId, chunk);

    const fetched = await pinecone.fetch([chunkId]);
    if (fetched.records && fetched.records[chunkId]) {
      console.log(`🔁 Skipping existing text chunk: ${chunkId}`);
      continue;
    }

    const embedding = await getEmbeddings(chunk);

    vectors.push({
      id: chunkId,
      values: Array.from(embedding),
      metadata: {
        tag: 'manual-input',
        content: chunk,// Use actual user ID instead of "demo"
        chunkIndex: i,
        createdAt: new Date().toISOString(),
      },
    });
  }

  if (vectors.length > 0) {
    // Filter out any vectors without values and cast to required type
    const validVectors = vectors.filter(v => v.values && v.values.length > 0) as {
      id: string;
      values: number[];
      metadata: Record<string, any>;
    }[];
    
    if (validVectors.length > 0) {
      await upsertToPinecone(validVectors);
      console.log(`✅ Successfully upserted ${validVectors.length} manual text chunks`);
    } else {
      console.log('⚠️ No valid vectors to upsert for manual text');
    }
  }

  allResults.push({
    source: 'manual-text',
    chunks: vectors.length,
    success: vectors.length > 0,
    skipped: false,
  });
}  // 🧾 Final Response

res.send(createResponse(allResults, "Content extraction and upsert completed successfully"));
});
//   res.status(200).json({
//     count: allResults.length,
//     successful: allResults.filter(r => r.success).length,
//     failed: allResults.filter(r => !r.success).length,
//     results: allResults,
//   });
// });

export const searchPinecone = asyncHandler(async (req: Request, res: Response) => {
  const queryVector = await getEmbeddings(req.body.query);


  const results = await pinecone.query({
    vector: Array.from(queryVector),
    topK: 5,
    includeMetadata: true,
  });
  
  res.send(createResponse(results, "Search results retrieved successfully"));
});

const search = async (queryVector: number[] | Float32Array) => {
  const results = await pinecone.query({
    vector: Array.from(queryVector),
    topK: 5,
    includeMetadata: true,
  });
  return results;
};
const chunkText = (text: string, chunkSize = 2000): string[] => {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};


export const rag = asyncHandler(async (req: Request, res: Response) => {
  const query = req.body.query;
    const queryEmbeddings = await getEmbeddings(req.body.query);
  const contextResults = await search(Array.from(queryEmbeddings));
  const results = await search(Array.from(queryEmbeddings));
  const context = results.matches?.map(r => r.metadata?.content).join('\n\n') || '';

  const answer = await askGemini(context, query);

  res.send(createResponse({ answer }, "RAG response generated successfully"));
});
