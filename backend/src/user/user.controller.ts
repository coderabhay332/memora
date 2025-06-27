import { response, type Request, type Response } from 'express';
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.helper";
import { createUserTokens } from '../common/services/passport-jwt.services';
import { type IUser } from "./user.dto";    
import * as userService from "./user.service";
import pinecone  from '../common/services/pinecone/pinecone.config';
import extractMedium from '../common/services/extractor/medium';
import extractContentWithMicrolink from '../common/services/extractor/linkdin&twiiter';
import { extractGenericContent } from '../common/services/extractor/generic';
import { upsertToPinecone } from '../common/services/pinecone/pineconeService';
import { getEmbeddings } from '../common/services/embeddings/embeddings';
import { generateDeterministicId } from '../common/services/idGenerator.service';
import { rag as ragService } from '../common/services/RAG/rag.config';
import { askGemini } from '../common/services/RAG/gemini.service';
type PineconeRecord = {
  id: string;
  values?: number[];
  text?: string;
  metadata?: Record<string, any>;
};

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const result = await userService.createUser(req.body);
  const { password, ...user } = result;
  res.send(createResponse(user, "User created successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const tokens = createUserTokens(user);
  res.send(
    createResponse({
      ...tokens,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    })
  );
});

