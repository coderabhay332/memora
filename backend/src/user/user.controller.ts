import { type Request, type Response } from 'express';
import asyncHandler from "express-async-handler";
import { createResponse } from "../common/helper/response.helper";
import { createUserTokens } from '../common/services/passport-jwt.services';
import { type IUser } from "./user.dto";    
import * as userService from "./user.service";
import extractMedium from '../common/services/extractor/medium';
import extractContentWithMicrolink from '../common/services/extractor/linkdin&twiiter';
import { extractGenericContent } from '../common/services/extractor/generic';
import { getEmbeddings } from '../common/services/embeddings/embeddings';
import { upsertToPinecone } from '../common/services/pinecone/pineconeService';

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

export const extract = asyncHandler(async (req: Request, res: Response) => {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const text = req.body.text || '';
  const links = text.match(urlRegex) || [];

  const taggedLinks = links.map((link: string) => {
    const domain = new URL(link).hostname;
    let tag: string;

    if (domain.includes("x.com") || domain.includes("twitter.com")) tag = "twitter";
    else if (domain.includes("medium.com")) tag = "medium";
    else if (domain.includes("linkedin.com")) tag = "linkedin";
    else tag = "generic";

    return { url: link, tag };
  });

  const processLinks = async (links: any[], extractorFn: (url: string) => Promise<any>) => {
    return await Promise.all(
      links.map(async (link, index) => {
        const content = await extractorFn(link.url);
        const actualText = typeof content === 'string' ? content : content?.content || content?.text || '';
        const embedding = await getEmbeddings(actualText);

        // Push to Pinecone
        await upsertToPinecone([{
          id: `doc-${Date.now()}-${index}`,
          values: Array.from(embedding),
          metadata: {
            url: link.url,
            tag: link.tag,
            content: actualText,
          },
        }]);

        return {
          url: link.url,
          content: actualText,
          embedding,
          tag: link.tag,
        };
      })
    );
  };

  const mediumEmbeds = await processLinks(taggedLinks.filter((l: any) => l.tag === 'medium'), extractMedium);
  const linkedinEmbeds = await processLinks(taggedLinks.filter((l: any) => l.tag === 'linkedin'), extractContentWithMicrolink);
  const twitterEmbeds = await processLinks(taggedLinks.filter((l: any) => l.tag === 'twitter'), extractContentWithMicrolink);
  const genericEmbeds = await processLinks(taggedLinks.filter((l: any) => l.tag === 'generic'), extractGenericContent);

  const allResults = [...mediumEmbeds, ...linkedinEmbeds, ...twitterEmbeds, ...genericEmbeds];

  res.status(200).json({
    count: allResults.length,
    results: allResults,
  });
});

export const embeddings = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;
  const embedding = await getEmbeddings(text);
  res.status(200).json({
    embedding
  });
});
