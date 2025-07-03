"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib_1 = __importDefault(require("amqplib"));
const pinecone_config_1 = __importDefault(require("../../common/services/pinecone/pinecone.config"));
const medium_1 = __importDefault(require("../../common/services/extractor/medium"));
const linkdin_twiiter_1 = __importDefault(require("../../common/services/extractor/linkdin&twiiter"));
const generic_1 = require("../../common/services/extractor/generic");
const pineconeService_1 = require("../../common/services/pinecone/pineconeService");
const embeddings_1 = require("../../common/services/embeddings/embeddings");
const idGenerator_service_1 = require("../../common/services/idGenerator.service");
const content_schema_1 = __importDefault(require("../content.schema"));
const database_services_1 = require("../../common/services/database.services");
(0, database_services_1.initDB)();
const chunkText = (text, chunkSize = 2000) => {
    try {
        if (!text || typeof text !== 'string') {
            console.warn('⚠️ Invalid text input for chunking');
            return [];
        }
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        console.log(`📚 Chunked text into ${chunks.length} parts`);
        return chunks;
    }
    catch (error) {
        console.error('❌ Error in chunkText:', error);
        return [];
    }
};
const startEmbeddingWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔌 Connecting to RabbitMQ...');
        const conn = yield amqplib_1.default.connect('amqp://localhost');
        console.log('✅ Connected to RabbitMQ');
        const channel = yield conn.createChannel();
        yield channel.assertQueue('embedding_jobs', { durable: true });
        console.log("📭 Queue 'embedding_jobs' is ready");
        console.log("✅ Embedding Worker is running and waiting for messages...");
        channel.consume('embedding_jobs', (msg) => __awaiter(void 0, void 0, void 0, function* () {
            if (msg === null) {
                console.log('⚠️ Received null message');
                return;
            }
            try {
                console.log('📥 Received message from queue');
                const startTime = Date.now();
                const messageContent = msg.content.toString();
                let parsedMessage;
                try {
                    parsedMessage = JSON.parse(messageContent);
                    console.log('📋 Message parsed successfully');
                }
                catch (parseError) {
                    console.error('❌ Failed to parse message content:', parseError);
                    channel.nack(msg, false, false); // discard invalid message
                    return;
                }
                let { userId, contentId } = parsedMessage;
                if (!userId || !contentId) {
                    console.warn('⚠️ Missing required fields in message');
                    channel.ack(msg); // acknowledge but don't process
                    return;
                }
                console.log(`🔄 Processing content for user ${userId}, content ID ${contentId}`);
                const text = yield content_schema_1.default.findById(contentId).select('content').lean();
                if (!text || !text.content) {
                    console.error(`❌ No content found for ID ${contentId}`);
                    channel.ack(msg); // acknowledge but don't process
                    return;
                }
                console.log("text", text);
                // URL processing
                const urlRegex = /https?:\/\/[^\s]+/g;
                const links = text.content.match(urlRegex) || [];
                const cleanText = text.content.replace(urlRegex, '').replace(/\s+/g, ' ').trim();
                console.log(`🔗 Found ${links.length} links in text`);
                console.log(`📝 Clean text length: ${cleanText.length} characters`);
                const validLinks = links.filter((link) => {
                    try {
                        new URL(link);
                        return true;
                    }
                    catch (_a) {
                        console.warn(`⚠️ Invalid URL found and will be skipped: ${link}`);
                        return false;
                    }
                });
                const taggedLinks = validLinks.map((link) => {
                    try {
                        const domain = new URL(link).hostname;
                        let tag = "generic";
                        if (domain.includes("x.com") || domain.includes("twitter.com"))
                            tag = "twitter";
                        else if (domain.includes("medium.com"))
                            tag = "medium";
                        else if (domain.includes("linkedin.com"))
                            tag = "linkedin";
                        console.log(`🏷️ Tagged URL ${link} as ${tag}`);
                        return { url: link, tag };
                    }
                    catch (error) {
                        console.error(`❌ Error processing URL ${link}:`, error);
                        return { url: link, tag: "generic" }; // fallback to generic
                    }
                });
                const extractorMap = {
                    medium: medium_1.default,
                    linkedin: linkdin_twiiter_1.default,
                    twitter: linkdin_twiiter_1.default,
                    generic: generic_1.extractGenericContent,
                };
                const processLinks = (links) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log(`🔗 Processing ${links.length} links...`);
                    const results = yield Promise.all(links.map((link) => __awaiter(void 0, void 0, void 0, function* () {
                        try {
                            console.log(`🌐 Extracting content from ${link.url} (${link.tag})`);
                            const extractorFn = extractorMap[link.tag] || generic_1.extractGenericContent;
                            let content;
                            try {
                                content = yield extractorFn(link.url);
                            }
                            catch (extractError) {
                                console.error(`❌ Failed to extract content from ${link.url}:`, extractError);
                                return null;
                            }
                            const actualText = typeof content === 'string' ? content : (content === null || content === void 0 ? void 0 : content.content) || (content === null || content === void 0 ? void 0 : content.text) || '';
                            if (!actualText) {
                                console.warn(`⚠️ No content extracted from ${link.url}`);
                                return null;
                            }
                            console.log(`📝 Extracted ${actualText.length} characters from ${link.url}`);
                            const chunks = chunkText(actualText.trim(), 1000);
                            console.log(`✂️ Chunked into ${chunks.length} parts`);
                            const vectors = [];
                            for (let i = 0; i < chunks.length; i++) {
                                const chunk = chunks[i];
                                const chunkId = (0, idGenerator_service_1.generateDeterministicId)(`${link.url}|${i}`);
                                let fetched;
                                try {
                                    fetched = yield pinecone_config_1.default.fetch([chunkId]);
                                }
                                catch (fetchError) {
                                    console.error(`❌ Failed to fetch record ${chunkId}:`, fetchError);
                                    continue;
                                }
                                if (fetched.records[chunkId]) {
                                    console.log(`⏩ Skipping already processed chunk ${i} of ${link.url}`);
                                    continue;
                                }
                                console.log(`🧠 Generating embedding for chunk ${i} of ${link.url}`);
                                let embedding;
                                try {
                                    embedding = yield (0, embeddings_1.getEmbeddings)(chunk, userId);
                                }
                                catch (embeddingError) {
                                    console.error(`❌ Failed to generate embedding for chunk ${i}:`, embeddingError);
                                    continue;
                                }
                                vectors.push({
                                    id: chunkId,
                                    values: Array.from(embedding),
                                    metadata: {
                                        url: link.url,
                                        tag: link.tag,
                                        chunkIndex: i,
                                        content: chunk,
                                        userId,
                                        contentId: contentId,
                                        createdAt: new Date().toISOString(),
                                    },
                                });
                            }
                            if (vectors.length > 0) {
                                const validVectors = vectors.filter(v => v.values !== undefined);
                                if (validVectors.length > 0) {
                                    console.log(`📤 Preparing to upsert ${validVectors.length} vectors for ${link.url}`);
                                    try {
                                        yield (0, pineconeService_1.upsertToPinecone)(validVectors);
                                        console.log(`✅ Successfully upserted vectors for ${link.url}`);
                                    }
                                    catch (upsertError) {
                                        console.error(`❌ Failed to upsert vectors for ${link.url}:`, upsertError);
                                    }
                                }
                            }
                            return { success: true, url: link.url };
                        }
                        catch (error) {
                            console.error(`❌ Error processing link ${link.url}:`, error);
                            return { success: false, url: link.url, error };
                        }
                    })));
                    const successCount = results.filter(r => r === null || r === void 0 ? void 0 : r.success).length;
                    console.log(`📊 Processed ${successCount}/${links.length} links successfully`);
                    return results;
                });
                if (taggedLinks.length > 0) {
                    console.log('🚀 Starting link processing');
                    yield processLinks(taggedLinks);
                    console.log('🏁 Finished link processing');
                }
                // Process clean text
                if (cleanText) {
                    console.log('📝 Processing clean text content');
                    const chunks = chunkText(cleanText, 1000);
                    const vectors = [];
                    for (let i = 0; i < chunks.length; i++) {
                        const chunk = chunks[i];
                        const chunkId = (0, idGenerator_service_1.generateDeterministicId)(cleanText + i);
                        let fetched;
                        try {
                            fetched = yield pinecone_config_1.default.fetch([chunkId]);
                        }
                        catch (fetchError) {
                            console.error(`❌ Failed to fetch record ${chunkId}:`, fetchError);
                            continue;
                        }
                        if (fetched.records[chunkId]) {
                            console.log(`⏩ Skipping already processed chunk ${i} of clean text`);
                            continue;
                        }
                        console.log(`🧠 Generating embedding for clean text chunk ${i}`);
                        let embedding;
                        try {
                            embedding = yield (0, embeddings_1.getEmbeddings)(chunk, userId);
                        }
                        catch (embeddingError) {
                            console.error(`❌ Failed to generate embedding for clean text chunk ${i}:`, embeddingError);
                            continue;
                        }
                        vectors.push({
                            id: chunkId,
                            values: Array.from(embedding),
                            metadata: {
                                content: chunk,
                                chunkIndex: i,
                                userId,
                                contentId: contentId,
                                tag: 'manual-input',
                                createdAt: new Date().toISOString(),
                            },
                        });
                    }
                    if (vectors.length > 0) {
                        const validVectors = vectors.filter(v => v.values !== undefined);
                        if (validVectors.length > 0) {
                            console.log(`📤 Preparing to upsert ${validVectors.length} vectors for clean text`);
                            try {
                                yield (0, pineconeService_1.upsertToPinecone)(validVectors);
                                console.log(`✅ Successfully upserted ${validVectors.length} vectors for user ${userId} and content ${contentId}`);
                            }
                            catch (upsertError) {
                                console.error('❌ Failed to upsert vectors for clean text:', upsertError);
                            }
                        }
                    }
                }
                channel.ack(msg);
                const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
                console.log(`🏁 Finished processing message in ${processingTime} seconds`);
            }
            catch (err) {
                console.error("❌ Worker error processing message:", err);
                // Check if the error is retryable
                const isRetryable = !(err instanceof SyntaxError); // Example: don't retry syntax errors
                if (isRetryable) {
                    console.log('🔄 Retrying message...');
                    channel.nack(msg, false, true);
                }
                else {
                    console.log('🗑️ Discarding non-retryable message');
                    channel.ack(msg); // or nack with false, false to discard
                }
            }
        }), { noAck: false });
        // Handle connection errors
        conn.on('error', (err) => {
            console.error('❌ RabbitMQ connection error:', err);
            // Implement reconnection logic here if needed
        });
        conn.on('close', () => {
            console.warn('⚠️ RabbitMQ connection closed');
            // Implement reconnection logic here if needed
        });
    }
    catch (error) {
        console.error('❌ Failed to start embedding worker:', error);
        // Implement retry logic for worker startup if needed
        process.exit(1); // Exit with error if critical
    }
});
// Start the worker
startEmbeddingWorker().catch(err => {
    console.error('❌ Fatal error in worker startup:', err);
    process.exit(1);
});
