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
const pineconeService_1 = require("../../common/services/pinecone/pineconeService");
const amqplib_1 = __importDefault(require("amqplib"));
// Initialize database connection
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const startDeleteWorker = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔌 Connecting to RabbitMQ...');
        const conn = yield amqplib_1.default.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        console.log('✅ Connected to RabbitMQ');
        const channel = yield conn.createChannel();
        yield channel.assertQueue('delete_jobs', {
            durable: true,
            arguments: {
                'x-message-ttl': 86400000,
                'x-max-length': 10000,
            }
        });
        console.log("✅ Delete Worker is running and waiting for messages...");
        channel.consume("delete_jobs", (msg) => __awaiter(void 0, void 0, void 0, function* () {
            if (!msg)
                return;
            const { contentId, userId } = JSON.parse(msg.content.toString());
            console.log(`🔄 Processing delete job for contentId: ${contentId}, userId: ${userId}`);
            let retryCount = 0;
            let success = false;
            while (retryCount < MAX_RETRIES && !success) {
                try {
                    yield (0, pineconeService_1.deleteFromPinecone)(contentId, userId);
                    channel.ack(msg);
                    console.log(`✅ Successfully deleted vectors for contentId: ${contentId}`);
                    success = true;
                }
                catch (error) {
                    retryCount++;
                    if (retryCount < MAX_RETRIES) {
                        console.log(`⚠️ Retry ${retryCount}/${MAX_RETRIES} for contentId ${contentId}`);
                        yield new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                    }
                    else {
                        console.error(`❌ Failed to delete vectors for contentId ${contentId} after ${MAX_RETRIES} attempts:`, error);
                        // You might want to send to a dead letter queue here
                        channel.nack(msg, false, false);
                    }
                }
            }
        }));
        // Handle connection errors
        conn.on('error', (err) => {
            console.error('❌ RabbitMQ connection error:', err);
        });
        conn.on('close', () => {
            console.warn('⚠️ RabbitMQ connection closed');
            // Consider implementing reconnection logic here
        });
    }
    catch (error) {
        console.error("❌ Error starting delete worker:", error);
        process.exit(1);
    }
});
startDeleteWorker().catch((error) => {
    console.error("❌ Fatal error in delete worker:", error);
    process.exit(1);
});
