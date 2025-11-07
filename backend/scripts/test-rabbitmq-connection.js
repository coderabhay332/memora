#!/usr/bin/env node

/**
 * RabbitMQ Connection Test Script
 * Tests connection to external RabbitMQ service
 */

const amqp = require('amqplib');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;

console.log('🐰 RabbitMQ Connection Test');
console.log('==========================');

if (!RABBITMQ_URL) {
  console.error('❌ RABBITMQ_URL not found in environment variables');
  console.log('Please set RABBITMQ_URL in your .env file');
  process.exit(1);
}

// Mask sensitive information in URL for logging
const maskedUrl = RABBITMQ_URL.replace(/(:\/\/[^:]+:)[^@]+(@)/, '$1***$2');
console.log(`🔗 Testing connection to: ${maskedUrl}`);

async function testConnection() {
  let connection = null;
  let channel = null;
  
  try {
    console.log('🔄 Attempting to connect...');
    
    // Test connection with timeout
    const connectionPromise = amqp.connect(RABBITMQ_URL, {
      heartbeat: 60,
      timeout: 30000, // 30 seconds timeout
      keepAlive: true,
      keepAliveDelay: 30000
    });
    
    // Add timeout to the connection promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
    });
    
    connection = await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Connection established successfully');
    
    // Test channel creation
    console.log('🔄 Creating channel...');
    channel = await connection.createChannel();
    console.log('✅ Channel created successfully');
    
    // Test queue operations
    console.log('🔄 Testing queue operations...');
    await channel.assertQueue('test_queue', { durable: false });
    console.log('✅ Queue operations successful');
    
    // Test message sending
    console.log('🔄 Testing message sending...');
    const testMessage = Buffer.from(JSON.stringify({ test: true, timestamp: new Date().toISOString() }));
    const sent = channel.sendToQueue('test_queue', testMessage, { persistent: false });
    
    if (sent) {
      console.log('✅ Message sent successfully');
    } else {
      console.log('⚠️ Message not sent (queue might be full)');
    }
    
    // Clean up test queue
    await channel.deleteQueue('test_queue');
    console.log('✅ Test queue cleaned up');
    
    console.log('\n🎉 All tests passed! RabbitMQ connection is working properly.');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code || 'N/A'}`);
    console.error(`Type: ${error.constructor.name}`);
    
    // Provide specific troubleshooting based on error type
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Check if the RabbitMQ service is running');
      console.log('- Verify the RABBITMQ_URL is correct');
      console.log('- Check network connectivity to the external service');
    } else if (error.code === 'ECONNRESET') {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Network connection was reset by the remote server');
      console.log('- Check if the external RabbitMQ service is stable');
      console.log('- Verify firewall settings');
      console.log('- Try connecting from a different network');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Connection timed out');
      console.log('- Check network latency to the external service');
      console.log('- Verify the service is accessible');
    } else if (error.message.includes('Authentication')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('- Check username and password in RABBITMQ_URL');
      console.log('- Verify user permissions on the external service');
    }
    
    process.exit(1);
  } finally {
    // Clean up connections
    try {
      if (channel) {
        await channel.close();
        console.log('🔌 Channel closed');
      }
      if (connection) {
        await connection.close();
        console.log('🔌 Connection closed');
      }
    } catch (cleanupError) {
      console.error('⚠️ Error during cleanup:', cleanupError.message);
    }
  }
}

// Run the test
testConnection();
