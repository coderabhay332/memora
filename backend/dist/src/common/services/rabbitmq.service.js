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
exports.rabbitMQService = exports.sendToQueue = exports.disconnectRabbitMQ = exports.isRabbitMQConnected = exports.getChannel = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimer = null;
        this.config = {
            url: process.env.RABBITMQ_URL || 'amqp://localhost',
            maxRetries: 10, // Increased for external services
            retryDelay: 3000, // Reduced initial delay for external services
            heartbeat: 30 // Reduced heartbeat for external services
        };
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isConnecting) {
                console.log('🔄 RabbitMQ connection already in progress...');
                return;
            }
            this.isConnecting = true;
            try {
                // Mask sensitive information in URL for logging
                const maskedUrl = this.config.url.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
                console.log(`🔄 Connecting to RabbitMQ: ${maskedUrl}`);
                // Create connection with proper options for external services
                this.connection = yield amqplib_1.default.connect(this.config.url, {
                    heartbeat: this.config.heartbeat,
                    timeout: 60000, // 60 seconds timeout for external services
                    keepAlive: true,
                    keepAliveDelay: 30000,
                    // Additional options for external services
                    noDelay: true,
                    family: 4 // Force IPv4
                });
                // Handle connection events
                this.connection.on('error', (error) => {
                    console.error('❌ RabbitMQ connection error:', error.message);
                    this.handleConnectionError();
                });
                this.connection.on('close', () => {
                    console.warn('⚠️ RabbitMQ connection closed');
                    this.handleConnectionError();
                });
                // Create channel
                this.channel = yield this.connection.createChannel();
                // Handle channel events
                this.channel.on('error', (error) => {
                    console.error('❌ RabbitMQ channel error:', error.message);
                    this.handleConnectionError();
                });
                this.channel.on('close', () => {
                    console.warn('⚠️ RabbitMQ channel closed');
                    this.handleConnectionError();
                });
                // Assert queues
                yield this.setupQueues();
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                console.log('✅ RabbitMQ connected successfully');
            }
            catch (error) {
                this.isConnecting = false;
                console.error('❌ Error connecting to RabbitMQ:', error);
                this.handleConnectionError();
                throw error;
            }
        });
    }
    setupQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.channel) {
                console.warn('⚠️ Channel not available during setupQueues');
                return;
            }
            const ch = this.channel; // snapshot to avoid race after close events
            // Helper to safely ensure a queue exists without changing its arguments
            const safeEnsureQueue = (name) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // Passive check: does not modify queue, avoids PRECONDITION_FAILED
                    yield ch.checkQueue(name);
                    return;
                }
                catch (e) {
                    const msg = (e && e.message) || String(e);
                    // 404 NOT-FOUND: queue does not exist -> create with minimal options
                    if ((e && e.code === 404) || msg.includes('NOT_FOUND')) {
                        try {
                            yield ch.assertQueue(name, { durable: true });
                            return;
                        }
                        catch (e2) {
                            console.error(`❌ Could not create queue '${name}':`, (e2 === null || e2 === void 0 ? void 0 : e2.message) || e2);
                            return;
                        }
                    }
                    // Other errors: log and skip to avoid closing the channel repeatedly
                    console.warn(`⚠️ checkQueue for '${name}' failed:`, msg);
                    return;
                }
            });
            // Assert all required queues with compatibility
            yield safeEnsureQueue('embedding_jobs');
            yield safeEnsureQueue('delete_jobs');
            console.log('📋 RabbitMQ queues configured');
        });
    }
    handleConnectionError() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        this.cleanup();
        if (this.reconnectAttempts < this.config.maxRetries) {
            this.reconnectAttempts++;
            const delay = this.config.retryDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
            console.log(`🔄 Attempting to reconnect to RabbitMQ in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.config.maxRetries})`);
            this.reconnectTimer = setTimeout(() => {
                this.connect().catch(error => {
                    console.error('❌ Reconnection failed:', error.message);
                });
            }, delay);
        }
        else {
            console.error('❌ Max reconnection attempts reached. RabbitMQ service unavailable.');
        }
    }
    cleanup() {
        if (this.channel) {
            this.channel.removeAllListeners();
            this.channel = null;
        }
        if (this.connection) {
            this.connection.removeAllListeners();
            this.connection = null;
        }
    }
    getChannel() {
        if (!this.channel) {
            throw new Error("RabbitMQ channel not available. Service may be reconnecting.");
        }
        return this.channel;
    }
    isConnected() {
        return this.connection !== null && this.channel !== null;
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
            }
            try {
                if (this.channel) {
                    yield this.channel.close();
                }
                if (this.connection) {
                    yield this.connection.close();
                }
            }
            catch (error) {
                console.error('❌ Error disconnecting from RabbitMQ:', error);
            }
            finally {
                this.cleanup();
            }
        });
    }
    sendToQueue(queueName, message, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.isConnected()) {
                    throw new Error('RabbitMQ not connected');
                }
                const channel = this.getChannel();
                return channel.sendToQueue(queueName, message, Object.assign({ persistent: true }, options));
            }
            catch (error) {
                console.error(`❌ Error sending message to queue ${queueName}:`, error);
                throw error;
            }
        });
    }
}
// Create singleton instance
const rabbitMQService = new RabbitMQService();
exports.rabbitMQService = rabbitMQService;
// Export functions for backward compatibility
const connectRabbitMQ = () => rabbitMQService.connect();
exports.connectRabbitMQ = connectRabbitMQ;
const getChannel = () => rabbitMQService.getChannel();
exports.getChannel = getChannel;
const isRabbitMQConnected = () => rabbitMQService.isConnected();
exports.isRabbitMQConnected = isRabbitMQConnected;
const disconnectRabbitMQ = () => rabbitMQService.disconnect();
exports.disconnectRabbitMQ = disconnectRabbitMQ;
const sendToQueue = (queueName, message, options) => rabbitMQService.sendToQueue(queueName, message, options);
exports.sendToQueue = sendToQueue;
