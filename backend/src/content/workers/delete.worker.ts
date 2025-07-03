import { initDB } from "../../common/services/database.services";
import { deleteFromPinecone } from "../../common/services/pinecone/pineconeService";
import amqp from 'amqplib';
import { getChannel } from "../../common/services/rabbitmq.service";
import index from "../../common/services/pinecone/pinecone.config";

// Initialize database connection
initDB();

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

const startDeleteWorker = async () => {
  try {
    console.log('🔌 Connecting to RabbitMQ...');
    const conn = await amqp.connect('amqp://localhost');
    console.log('✅ Connected to RabbitMQ');

    const channel = await conn.createChannel();
    await channel.assertQueue('delete_jobs', { 
      durable: true,
      arguments: {
        'x-message-ttl': 86400000,
        'x-max-length': 10000,
      }
    });

    console.log("✅ Delete Worker is running and waiting for messages...");

    channel.consume("delete_jobs", async (msg) => {
      if (!msg) return;
      const { contentId, userId } = JSON.parse(msg.content.toString());
      console.log(`🔄 Processing delete job for contentId: ${contentId}, userId: ${userId}`);
      
      let retryCount = 0;
      let success = false;

      while (retryCount < MAX_RETRIES && !success) {
        try {
         
          await deleteFromPinecone(contentId, userId);
          
          channel.ack(msg);
          console.log(`✅ Successfully deleted vectors for contentId: ${contentId}`);
          success = true;
        } catch (error) {
          retryCount++;
          
          if (retryCount < MAX_RETRIES) {
            console.log(`⚠️ Retry ${retryCount}/${MAX_RETRIES} for contentId ${contentId}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          } else {
            console.error(`❌ Failed to delete vectors for contentId ${contentId} after ${MAX_RETRIES} attempts:`, error);
            // You might want to send to a dead letter queue here
            channel.nack(msg, false, false);
          }
        }
      }
    });

    // Handle connection errors
    conn.on('error', (err) => {
      console.error('❌ RabbitMQ connection error:', err);
    });

    conn.on('close', () => {
      console.warn('⚠️ RabbitMQ connection closed');
      // Consider implementing reconnection logic here
    });

  } catch (error) {
    console.error("❌ Error starting delete worker:", error);
    process.exit(1);
  }
}

startDeleteWorker().catch((error) => {
  console.error("❌ Fatal error in delete worker:", error);
  process.exit(1);
});