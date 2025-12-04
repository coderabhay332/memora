import { response, type Request, type Response } from 'express';
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.helper";
import pinecone  from '../common/services/pinecone/pinecone.config';
import * as contentService from './content.service';
import { getEmbeddings } from '../common/services/embeddings/embeddings';
import { askGemini } from '../common/services/RAG/gemini.service';
import { IUser } from '../user/user.dto';
import { getChannel, sendToQueue, isRabbitMQConnected } from '../common/services/rabbitmq.service';
import { SourceInfoService } from '../common/services/RAG/source-info.service';
import { Message } from '../chat/chat.schema';
type PineconeRecord = {
  id: string;
  values?: number[];
  text?: string;
  contentId?: string;
  metadata?: Record<string, any>;
};



export const searchPinecone = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id
  if (!userId) {
    res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  const queryVector = await getEmbeddings(req.body.query, userId);


  const results = await pinecone.query({
    vector: Array.from(queryVector),
    topK: 5,
    includeMetadata: true,
    filter: {
      userId: req.body.userId, // Filter by user ID if provided
    }
  });
  
  res.send(createResponse(results, "Search results retrieved successfully"));
});

const search = async (queryVector: number[] | Float32Array, userId: string) => {
  const results = await pinecone.query({
    vector: Array.from(queryVector),
    topK: 5,
    includeMetadata: true,
    filter: {
      userId: userId,
    }
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
  const {id} = req.params; 
  console.log("chatId", id);
  if (!id || typeof id !== 'string') {
    res.status(400).send(createResponse(null, "Chat ID is required"));
    return;
  }
  const query = req.body.query;
  const userId = req.user?._id;
  if (!query || !userId) {
    res.status(400).send(createResponse(null, "Query and User ID are required"));
    return;
  }

  try {
    let optimizedContext = '';
    let contentId = '';
    let queryAnalysis = { intent: 'question', complexity: 'simple' } as any;
    let rawContextLength = 0;
    let relevantChunksCount = 0;

    // Always use embeddings for RAG
    const queryEmbeddings = await getEmbeddings(req.body.query, userId);
    const results = await search(Array.from(queryEmbeddings), userId);
    console.log("results", results);

    // Check if we have relevant matches with good similarity scores
    const MIN_RELEVANCE_SCORE = 0.5; // Minimum similarity score threshold
    const MIN_CONTEXT_LENGTH = 50; // Minimum context length to be considered meaningful
    
    const topMatch = results.matches?.[0];
    const hasRelevantMatch = topMatch && topMatch.score && topMatch.score >= MIN_RELEVANCE_SCORE;
    
    const contentIdRaw = hasRelevantMatch ? topMatch.metadata?.contentId : null;
    contentId = contentIdRaw ? String(contentIdRaw) : '';

    // Extract raw context from search results - simplified to avoid memory issues
    // Check both 'content' (for URL-extracted) and 'contentSnippet' (for manual input)
    const rawContext = results.matches?.slice(0, 3).map(r => r.metadata?.content || r.metadata?.contentSnippet || '').filter(c => c).join('\n\n').slice(0, 4000) || '';
    console.log("📝 Extracted context length:", rawContext.length, "characters");
    console.log("📊 Top match score:", topMatch?.score || 'N/A');
    
    // Only consider context valid if it meets minimum requirements
    const hasValidContext = rawContext.length >= MIN_CONTEXT_LENGTH && hasRelevantMatch;
    
    if (rawContext.length > 0) {
      console.log("📝 Context preview:", rawContext.substring(0, 200));
    } else {
      console.warn("⚠️ No context extracted from search results");
    }
    
    if (!hasValidContext) {
      console.log("⚠️ Context doesn't meet relevance threshold - will not return contentId");
      contentId = ''; // Clear contentId if context is not relevant
    }

    // Simple query analysis without heavy processing
    queryAnalysis = {
      intent: query.includes('?') ? 'question' : 'summary',
      complexity: query.length > 50 ? 'medium' : 'simple',
      requiresContext: true
    };
    console.log("Query analysis:", queryAnalysis);

    // Use raw context directly - skip heavy processing to save memory
    optimizedContext = rawContext;
    rawContextLength = rawContext.length;
    relevantChunksCount = results.matches?.length || 0;

    const contentIdToPass = hasValidContext ? contentId : '';
    const ragResponse = await askGemini(userId, id, optimizedContext, query, contentIdToPass);

    // Only fetch source info if we have a valid contentId
    const finalContentId = ragResponse.contentId || '';
    const sourceInfo = finalContentId 
      ? await SourceInfoService.getSourceInfo(finalContentId, userId)
      : null;
    
    // Get content preview for better context
    const contentPreview = finalContentId && sourceInfo
      ? await SourceInfoService.getContentPreview(finalContentId, userId, 300)
      : null;

    const enrichedSourceInfo = sourceInfo
      ? {
          ...sourceInfo,
          preview: contentPreview ?? null,
        }
      : null;

    const attribution = sourceInfo ? SourceInfoService.createAttributionText([sourceInfo]) : null;

    const contextStatsPayload = {
      originalLength: rawContextLength,
      optimizedLength: optimizedContext.length,
      relevantChunks: relevantChunksCount,
      queryIntent: queryAnalysis.intent,
      queryComplexity: queryAnalysis.complexity,
    };

    if (ragResponse.messageId) {
      await Message.findByIdAndUpdate(ragResponse.messageId, {
        $set: {
          contentId: finalContentId || null,
          sourceInfo: enrichedSourceInfo,
          attribution,
          contextStats: contextStatsPayload,
        },
      }).catch((error) => {
        console.error('Failed to enrich assistant message with source metadata:', error);
      });
    }

    res.send(createResponse({ 
      answer: ragResponse.answer,
      contentId: finalContentId,
      chatId: ragResponse.chatId,
      sourceInfo: enrichedSourceInfo,
      attribution,
      contextStats: contextStatsPayload,
    }, "Enhanced RAG response generated successfully"));
    
  } catch (error) {
    console.error("RAG processing error:", error);
    res.status(500).send(createResponse(null, "Failed to process RAG request"));
  }
});


export const createContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)._id;
  if(!userId){
     res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  
  try {
    const result = await contentService.createContent(req.body.content, userId);
    
    // Send to RabbitMQ queue with improved error handling
    if (isRabbitMQConnected()) {
      try {
        await sendToQueue(
          'embedding_jobs',
          Buffer.from(JSON.stringify({ contentId: result._id, userId }))
        );
        console.log(`📤 Sent embedding job for content ${result._id}`);
      } catch (queueError) {
        console.error('❌ Failed to send embedding job to queue:', queueError);
        // Don't fail the request if queue is unavailable
      }
    } else {
      console.warn('⚠️ RabbitMQ not connected, embedding job will be queued when connection is restored');
    }

    res.send(createResponse(result, "Content created successfully"));
  } catch (error) {
    console.error('❌ Error creating content:', error);
    res.status(500).send(createResponse(null, "Failed to create content"));
  }
});

export const getAllContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)._id;
  if(!userId){
     res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  const result = await contentService.getAllContent(userId);
  res.send(createResponse(result, "All content fetched successfully"));
});
export const getContentById = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)._id;
  if(!userId){
     res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  const result = await contentService.getContentById(req.params.id, userId);
  res.send(createResponse(result, "Content fetched successfully"));
});

// New endpoint for RAG source navigation
export const getRAGSource = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)._id;
  const { contentId } = req.params;
  
  if (!userId) {
    res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  
  if (!contentId) {
    res.status(400).send(createResponse(null, "Content ID is required"));
    return;
  }

  try {
    // Get detailed source information
    const sourceInfo = await SourceInfoService.getSourceInfo(contentId, userId);
    
    if (!sourceInfo) {
      res.status(404).send(createResponse(null, "Content not found or access denied"));
      return;
    }

    // Get full content for the source
    const fullContent = await contentService.getContentById(contentId, userId);
    
    res.send(createResponse({
      sourceInfo,
      fullContent,
      navigationUrl: `/content/${contentId}`,
      canEdit: true, // User can edit their own content
      canDelete: true
    }, "RAG source information retrieved successfully"));
    
  } catch (error) {
    console.error("Error fetching RAG source:", error);
    res.status(500).send(createResponse(null, "Failed to fetch source information"));
  }
});

export const updateContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)._id;
  if(!userId){
     res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  const result = await contentService.updateContent(req.params.id, req.body.content, userId);
  res.send(createResponse(result, "Content updated successfully"));
});

export const deleteContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)._id;
  if(!userId){
     res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  
  try {
    const result = await contentService.deleteContent(req.params.id, userId);

    if (!result) {
      res.status(404).send(createResponse(null, "Content not found"));
      return;
    }

    // Send delete job to RabbitMQ queue with improved error handling
    if (isRabbitMQConnected()) {
      try {
        await sendToQueue(
          'delete_jobs',
          Buffer.from(JSON.stringify({ contentId: result._id, userId }))
        );
        console.log(`📤 Sent delete job for content ${result._id}`);
      } catch (queueError) {
        console.error('❌ Failed to send delete job to queue:', queueError);
        // Don't fail the request if queue is unavailable
      }
    } else {
      console.warn('⚠️ RabbitMQ not connected, delete job will be queued when connection is restored');
    }

    res.send(createResponse(result, "Content deleted successfully"));
  } catch (error) {
    console.error('❌ Error deleting content:', error);
    res.status(500).send(createResponse(null, "Failed to delete content"));
  }
});