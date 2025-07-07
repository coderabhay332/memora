import { response, type Request, type Response } from 'express';
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.helper";
import pinecone  from '../common/services/pinecone/pinecone.config';
import * as contentService from './content.service';
import { getEmbeddings } from '../common/services/embeddings/embeddings';
import { askGemini } from '../common/services/RAG/gemini.service';
import { IUser } from '../user/user.dto';
import { getChannel } from '../common/services/rabbitmq.service';
import { askOpenAI } from '../common/services/RAG/gpt.service';
type PineconeRecord = {
  id: string;
  values?: number[];
  text?: string;
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
  const {chatId} = req.params; // Optional chat ID
  console.log("chatId", chatId);
  if (!chatId || typeof chatId !== 'string') {
    res.status(400).send(createResponse(null, "Chat ID is required"));
    return;
  }
  const query = req.body.query;
  const userId = req.user?._id;
  if (!query || !userId) {
    res.status(400).send(createResponse(null, "Query and User ID are required"));
    return;
  }

  const queryEmbeddings = await getEmbeddings(req.body.query, userId);
  const contextResults = await search(Array.from(queryEmbeddings), userId);
  const results = await search(Array.from(queryEmbeddings), userId);
  const context = results.matches?.map(r => r.metadata?.content).join('\n\n') || '';

  const answer = await askGemini(userId, chatId, context, query);

  res.send(createResponse({ answer }, "RAG response generated successfully"));
});


export const createContent = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as IUser)._id;
  console.log("userId", userId);
  if(!userId){
     res.status(400).send(createResponse(null, "User ID is required"));
    return;
  }
  const result = await contentService.createContent(req.body.content, userId);
  const channel = await getChannel();
  if (!channel) {
    res.status(500).send(createResponse(null, "Failed to create RabbitMQ channel"));
    return;
  }
   channel.sendToQueue(
    'embedding_jobs',
    Buffer.from(JSON.stringify({ contentId: result._id, userId }))
  );
  

  res.send(createResponse(result, "Content created successfully"));
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
  const result = await contentService.deleteContent(req.params.id, userId);

  if (!result) {
    res.status(404).send(createResponse(null, "Content not found"));
    return;
  }

  const channel = await getChannel();
  if (!channel) {
    console.error("Failed to get channel");
    return;
  }

  channel.sendToQueue(
    'delete_jobs',
    Buffer.from(JSON.stringify({ contentId: result._id, userId }))
  );

  res.send(createResponse(result, "Content deleted successfully"));
});