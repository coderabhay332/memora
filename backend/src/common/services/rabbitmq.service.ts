import ampq from 'amqplib';

interface RabbitMQConfig {
  url: string;
  maxRetries: number;
  retryDelay: number;
  heartbeat: number;
}

class RabbitMQService {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQConfig;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      url: process.env.RABBITMQ_URL || 'amqp://localhost',
      maxRetries: 10, // Increased for external services
      retryDelay: 3000, // Reduced initial delay for external services
      heartbeat: 30 // Reduced heartbeat for external services
    };
  }

  async connect(): Promise<void> {
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
      this.connection = await ampq.connect(this.config.url, {
        heartbeat: this.config.heartbeat,
        timeout: 60000, // 60 seconds timeout for external services
        keepAlive: true,
        keepAliveDelay: 30000,
        // Additional options for external services
        noDelay: true,
        family: 4 // Force IPv4
      });

      // Handle connection events
      this.connection.on('error', (error: Error) => {
        console.error('❌ RabbitMQ connection error:', error.message);
        this.handleConnectionError();
      });

      this.connection.on('close', () => {
        console.warn('⚠️ RabbitMQ connection closed');
        this.handleConnectionError();
      });

      // Create channel
      this.channel = await this.connection.createChannel();
      
      // Handle channel events
      this.channel.on('error', (error: Error) => {
        console.error('❌ RabbitMQ channel error:', error.message);
        this.handleConnectionError();
      });

      this.channel.on('close', () => {
        console.warn('⚠️ RabbitMQ channel closed');
        this.handleConnectionError();
      });

      // Assert queues
      await this.setupQueues();
      
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      console.log('✅ RabbitMQ connected successfully');
      
    } catch (error) {
      this.isConnecting = false;
      console.error('❌ Error connecting to RabbitMQ:', error);
      this.handleConnectionError();
      throw error;
    }
  }

  private async setupQueues(): Promise<void> {
    if (!this.channel) {
      console.warn('⚠️ Channel not available during setupQueues');
      return;
    }
    
    const ch = this.channel; // snapshot to avoid race after close events

    // Helper to safely ensure a queue exists without changing its arguments
    const safeEnsureQueue = async (name: string) => {
      try {
        // Passive check: does not modify queue, avoids PRECONDITION_FAILED
        await ch.checkQueue(name);
        return;
      } catch (e: any) {
        const msg = (e && e.message) || String(e);
        // 404 NOT-FOUND: queue does not exist -> create with minimal options
        if ((e && e.code === 404) || msg.includes('NOT_FOUND')) {
          try {
            await ch.assertQueue(name, { durable: true });
            return;
          } catch (e2: any) {
            console.error(`❌ Could not create queue '${name}':`, e2?.message || e2);
            return;
          }
        }
        // Other errors: log and skip to avoid closing the channel repeatedly
        console.warn(`⚠️ checkQueue for '${name}' failed:`, msg);
        return;
      }
    };

    // Assert all required queues with compatibility
    await safeEnsureQueue('embedding_jobs');
    await safeEnsureQueue('delete_jobs');

    console.log('📋 RabbitMQ queues configured');
  }

  private handleConnectionError(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.cleanup();
    
    if (this.reconnectAttempts < this.config.maxRetries) {
      this.reconnectAttempts++;
      const delay = this.config.retryDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      
      console.log(`🔄 Attempting to reconnect to RabbitMQ in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.config.maxRetries})`);
      
      this.reconnectTimer = setTimeout(() => {
        this.connect().catch(error => {
          console.error('❌ Reconnection failed:', error.message);
        });
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached. RabbitMQ service unavailable.');
    }
  }

  private cleanup(): void {
    if (this.channel) {
      this.channel.removeAllListeners();
      this.channel = null;
    }
    
    if (this.connection) {
      this.connection.removeAllListeners();
      this.connection = null;
    }
  }

  getChannel(): any {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available. Service may be reconnecting.");
    }
    return this.channel;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      console.error('❌ Error disconnecting from RabbitMQ:', error);
    } finally {
      this.cleanup();
    }
  }

  async sendToQueue(queueName: string, message: Buffer, options?: any): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        throw new Error('RabbitMQ not connected');
      }
      
      const channel = this.getChannel();
      return channel.sendToQueue(queueName, message, {
        persistent: true,
        ...options
      });
    } catch (error) {
      console.error(`❌ Error sending message to queue ${queueName}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const rabbitMQService = new RabbitMQService();

// Export functions for backward compatibility
export const connectRabbitMQ = () => rabbitMQService.connect();
export const getChannel = () => rabbitMQService.getChannel();
export const isRabbitMQConnected = () => rabbitMQService.isConnected();
export const disconnectRabbitMQ = () => rabbitMQService.disconnect();
export const sendToQueue = (queueName: string, message: Buffer, options?: any) => 
  rabbitMQService.sendToQueue(queueName, message, options);

// Export the service instance for advanced usage
export { rabbitMQService };
