import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY ?? "",
});

const indexName = process.env.PINECONE_INDEX_NAME ?? "test-index";

const index = pc.Index(indexName);

export default index; 