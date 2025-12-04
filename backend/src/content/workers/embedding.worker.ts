import amqp from 'amqplib';
import pinecone from '../../common/services/pinecone/pinecone.config';
import extractMedium from '../../common/services/extractor/medium';
import extractContentWithMicrolink from '../../common/services/extractor/linkdin&twiiter';
import { extractGenericContent } from '../../common/services/extractor/generic';
import { upsertToPinecone } from '../../common/services/pinecone/pineconeService';
import { getEmbeddings } from '../../common/services/embeddings/embeddings';
import { generateDeterministicId } from '../../common/services/idGenerator.service';
import Content from '../content.schema';
import { initDB } from '../../common/services/database.services';
import index from '../../common/services/pinecone/pinecone.config';
type PineconeRecord = {
  id: string;
  values?: number[];
  text?: string;
  metadata?: Record<string, any>;
};

initDB()

const chunkText = (text: string, chunkSize = 2000): string[] => {
  try {
    if (!text || typeof text !== 'string') {
      console.warn('⚠️ Invalid text input for chunking');
      return [];
    }

    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    console.log(`📚 Chunked text into ${chunks.length} parts`);
    return chunks;
  } catch (error) {
    console.error('❌ Error in chunkText:', error);
    return [];
  }
};

const startEmbeddingWorker = async () => {
  try {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    const masked = url.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
    console.log('🔌 Connecting to RabbitMQ...', masked);
    const conn = await amqp.connect(url);
    console.log('✅ Connected to RabbitMQ');

    const channel = await conn.createChannel();
    // Limit unacked messages delivered to this worker to 1 so we don't process
    // too many large jobs in parallel and run out of memory.
    try {
      channel.prefetch(1);
      console.log('🔒 Channel prefetch set to 1 (one message at a time)');
    } catch (e) {
      console.warn('⚠️ Failed to set channel prefetch:', e);
    }
    // Passive check to avoid PRECONDITION_FAILED if queue exists with different args
    try {
      await channel.checkQueue('embedding_jobs');
    } catch (e: any) {
      const msg = (e && e.message) || String(e);
      if ((e && e.code === 404) || msg.includes('NOT_FOUND')) {
        // Create minimally if not exists
        await channel.assertQueue('embedding_jobs', { durable: true });
      } else {
        console.warn("⚠️ checkQueue('embedding_jobs') failed:", msg);
      }
    }
    console.log("📭 Queue 'embedding_jobs' is ready");

    console.log("✅ Embedding Worker is running and waiting for messages...");

    channel.consume('embedding_jobs', async (msg) => {
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
        } catch (parseError) {
          console.error('❌ Failed to parse message content:', parseError);
          channel.nack(msg, false, false); // discard invalid message
          return;
        }

        let { userId, contentId } = parsedMessage;
        if ( !userId || !contentId) {
          console.warn('⚠️ Missing required fields in message');
          channel.ack(msg); // acknowledge but don't process
          return;
        }

        console.log(`🔄 Processing content for user ${userId}, content ID ${contentId}`);

        const text = await Content.findById(contentId).select('content').lean();
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

        const validLinks = links.filter((link: string) => {
          try {
            new URL(link);
            return true;
          } catch {
            console.warn(`⚠️ Invalid URL found and will be skipped: ${link}`);
            return false;
          }
        });

        const taggedLinks = validLinks.map((link: string) => {
          try {
            const domain = new URL(link).hostname;
            let tag = "generic";

            if (domain.includes("x.com") || domain.includes("twitter.com")) tag = "twitter";
            else if (domain.includes("medium.com")) tag = "medium";
            else if (domain.includes("linkedin.com")) tag = "linkedin";

            console.log(`🏷️ Tagged URL ${link} as ${tag}`);
            return { url: link, tag };
          } catch (error) {
            console.error(`❌ Error processing URL ${link}:`, error);
            return { url: link, tag: "generic" }; // fallback to generic
          }
        });

        const extractorMap: Record<string, (url: string) => Promise<any>> = {
          medium: extractMedium,
          linkedin: extractContentWithMicrolink,
          twitter: extractContentWithMicrolink,
          generic: extractGenericContent,
        };

        const processLinks = async (links: Array<{ url: string; tag: string }>) => {
          console.log(`🔗 Processing ${links.length} links...`);
          const results = await Promise.all(links.map(async (link) => {
            try {
              console.log(`🌐 Extracting content from ${link.url} (${link.tag})`);
              const extractorFn = extractorMap[link.tag] || extractGenericContent;
              
              let content;
              try {
                content = await extractorFn(link.url);
              } catch (extractError) {
                console.error(`❌ Failed to extract content from ${link.url}:`, extractError);
                return null;
              }

              const actualText = typeof content === 'string' ? content : content?.content || content?.text || '';
              if (!actualText) {
                console.warn(`⚠️ No content extracted from ${link.url}`);
                return null;
              }

              console.log(`📝 Extracted ${actualText.length} characters from ${link.url}`);
              const chunks = chunkText(actualText.trim(), 1000);
              console.log(`✂️ Chunked into ${chunks.length} parts`);

              const vectors: PineconeRecord[] = [];

              for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const chunkId = generateDeterministicId(`${link.url}|${i}`);
                
                let fetched;
                try {
                  fetched = await pinecone.fetch([chunkId]);
                } catch (fetchError) {
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
                  embedding = await getEmbeddings(chunk, userId);
                } catch (embeddingError) {
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
                const validVectors = vectors.filter(v => v.values !== undefined) as {
                  id: string;
                  values: number[];
                  metadata: Record<string, any>;
                }[];
                
                if (validVectors.length > 0) {
                  console.log(`📤 Preparing to upsert ${validVectors.length} vectors for ${link.url}`);
                  try {
                    await upsertToPinecone(validVectors);
                    console.log(`✅ Successfully upserted vectors for ${link.url}`);
                  } catch (upsertError) {
                    console.error(`❌ Failed to upsert vectors for ${link.url}:`, upsertError);
                  }
                }
              }

              return { success: true, url: link.url };
            } catch (error) {
              console.error(`❌ Error processing link ${link.url}:`, error);
              return { success: false, url: link.url, error };
            }
          }));

          const successCount = results.filter(r => r?.success).length;
          console.log(`📊 Processed ${successCount}/${links.length} links successfully`);
          return results;
        };

        if (taggedLinks.length > 0) {
          console.log('🚀 Starting link processing (sequential, memory-friendly)');
          // Process links sequentially to avoid spawning many concurrent
          // extractors/embedding requests which can blow memory/CPU.
          for (const l of taggedLinks) {
            // eslint-disable-next-line no-await-in-loop
            await processLinks([l]);
          }
          console.log('🏁 Finished link processing');
        }

        // Process clean text
        if (cleanText) {
          console.log('📝 Processing clean text content');
          const chunks = chunkText(cleanText, 1000);
          const vectors: PineconeRecord[] = [];

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const chunkId = generateDeterministicId(cleanText + i);
            
            let fetched;
            try {
              fetched = await pinecone.fetch([chunkId]);
            } catch (fetchError) {
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
              embedding = await getEmbeddings(chunk, userId);
            } catch (embeddingError) {
              console.error(`❌ Failed to generate embedding for clean text chunk ${i}:`, embeddingError);
              continue;
            }

            // Keep the stored metadata small: save a snippet instead of whole chunk
            const snippet = (typeof chunk === 'string') ? chunk.slice(0, 500) : '';
            vectors.push({
              id: chunkId,
              values: Array.from(embedding),
              metadata: {
                contentSnippet: snippet,
                chunkIndex: i,
                userId,
                contentId: contentId,
                tag: 'manual-input',
                createdAt: new Date().toISOString(),
              },
            });
          }
          if (vectors.length > 0) {
            const validVectors = vectors.filter(v => v.values !== undefined) as {
              id: string;
              values: number[];
              metadata: Record<string, any>;
            }[];

            // Upsert in batches to avoid building one huge request in memory
            const BATCH_SIZE = 50;
            for (let i = 0; i < validVectors.length; i += BATCH_SIZE) {
              const batch = validVectors.slice(i, i + BATCH_SIZE);
              console.log(`📤 Upserting batch ${i / BATCH_SIZE + 1} with ${batch.length} vectors`);
              try {
                // eslint-disable-next-line no-await-in-loop
                await upsertToPinecone(batch);
              } catch (upsertError) {
                console.error(`❌ Failed to upsert batch starting at ${i}:`, upsertError);
              }
            }

            // Help GC by clearing the array reference
            vectors.length = 0;
          }
        }

        channel.ack(msg);
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`🏁 Finished processing message in ${processingTime} seconds`);
      } catch (err) {
        console.error("❌ Worker error processing message:", err);
        
        // Check if the error is retryable
        const isRetryable = !(err instanceof SyntaxError); // Example: don't retry syntax errors
        
        if (isRetryable) {
          console.log('🔄 Retrying message...');
          channel.nack(msg, false, true);
        } else {
          console.log('🗑️ Discarding non-retryable message');
          channel.ack(msg); // or nack with false, false to discard
        }
      }
    }, { noAck: false });

    // Handle connection errors
    conn.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
      // Implement reconnection logic here if needed
    });

    conn.on('close', () => {
      console.warn('⚠️ RabbitMQ connection closed');
      // Implement reconnection logic here if needed
    });

  } catch (error) {
    console.error('❌ Failed to start embedding worker:', error);
    // Implement retry logic for worker startup if needed
    process.exit(1); // Exit with error if critical
  }
};

// Start the worker
startEmbeddingWorker().catch(err => {
  console.error('❌ Fatal error in worker startup:', err);
  process.exit(1);
});