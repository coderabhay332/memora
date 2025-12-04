#!/usr/bin/env node

/**
 * RabbitMQ Startup Script
 * This script helps start RabbitMQ if it's not running
 */

const { exec } = require('child_process');
const os = require('os');

const platform = os.platform();

console.log('🐰 RabbitMQ Startup Helper');
console.log('========================');

function startRabbitMQ() {
  let command;
  
  switch (platform) {
    case 'win32':
      // Windows - try to start RabbitMQ service
      command = 'net start RabbitMQ';
      break;
    case 'darwin':
      // macOS - using Homebrew
      command = 'brew services start rabbitmq';
      break;
    case 'linux':
      // Linux - using systemctl
      command = 'sudo systemctl start rabbitmq-server';
      break;
    default:
      console.log('❌ Unsupported platform:', platform);
      return;
  }
  
  console.log(`🔄 Starting RabbitMQ on ${platform}...`);
  console.log(`Command: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error starting RabbitMQ:', error.message);
      console.log('\n📋 Manual startup instructions:');
      
      switch (platform) {
        case 'win32':
          console.log('1. Open Services (services.msc)');
          console.log('2. Find "RabbitMQ" service');
          console.log('3. Right-click and select "Start"');
          console.log('4. Or run: net start RabbitMQ');
          break;
        case 'darwin':
          console.log('1. Install RabbitMQ: brew install rabbitmq');
          console.log('2. Start service: brew services start rabbitmq');
          console.log('3. Or run: rabbitmq-server');
          break;
        case 'linux':
          console.log('1. Install RabbitMQ: sudo apt-get install rabbitmq-server');
          console.log('2. Start service: sudo systemctl start rabbitmq-server');
          console.log('3. Enable auto-start: sudo systemctl enable rabbitmq-server');
          break;
      }
    } else {
      console.log('✅ RabbitMQ started successfully!');
      console.log('📊 Management UI: http://localhost:15672');
      console.log('👤 Default credentials: guest/guest');
    }
  });
}

function checkRabbitMQStatus() {
  const command = platform === 'win32' 
    ? 'sc query RabbitMQ' 
    : 'systemctl is-active rabbitmq-server';
    
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log('❌ RabbitMQ is not running');
      startRabbitMQ();
    } else {
      console.log('✅ RabbitMQ is already running');
      console.log('📊 Management UI: http://localhost:15672');
    }
  });
}

// Check if RabbitMQ is running
checkRabbitMQStatus();
