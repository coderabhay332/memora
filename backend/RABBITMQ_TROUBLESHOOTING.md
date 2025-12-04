# RabbitMQ Troubleshooting Guide

## Common Issues and Solutions

### 1. ECONNRESET Error
**Error:** `Error: read ECONNRESET`

**Causes:**
- RabbitMQ server is not running
- Network connectivity issues
- Connection timeout
- RabbitMQ server overloaded

**Solutions:**

#### Check if RabbitMQ is running:
```bash
# Windows
sc query RabbitMQ

# macOS/Linux
systemctl is-active rabbitmq-server
# or
ps aux | grep rabbitmq
```

#### Start RabbitMQ:
```bash
# Windows
net start RabbitMQ

# macOS (Homebrew)
brew services start rabbitmq

# Linux
sudo systemctl start rabbitmq-server
```

#### Check RabbitMQ status:
```bash
# Check if port 5672 is listening
netstat -an | grep 5672

# Test connection
telnet localhost 5672
```

### 2. Connection Timeout
**Error:** Connection timeout after 30 seconds

**Solutions:**
- Check RabbitMQ server logs
- Verify network connectivity
- Increase timeout in connection options
- Check firewall settings

### 3. Authentication Errors
**Error:** Authentication failed

**Solutions:**
- Verify username/password in RABBITMQ_URL
- Check RabbitMQ user permissions
- Reset RabbitMQ admin password

### 4. Queue Not Found
**Error:** Queue does not exist

**Solutions:**
- Ensure queues are properly declared
- Check queue naming consistency
- Verify queue durability settings

## Environment Configuration

### 1. RABBITMQ_URL Format
```
# Local development
RABBITMQ_URL=amqp://localhost

# With authentication
RABBITMQ_URL=amqp://username:password@localhost:5672

# With virtual host
RABBITMQ_URL=amqp://username:password@localhost:5672/vhost
```

### 2. Connection Options
The improved service includes:
- Heartbeat: 60 seconds
- Timeout: 30 seconds
- Keep-alive: Enabled
- Automatic reconnection: 5 attempts with exponential backoff

## Installation Guide

### Windows
1. Download RabbitMQ installer from https://www.rabbitmq.com/download.html
2. Install with default settings
3. Start the service:
   ```cmd
   net start RabbitMQ
   ```
4. Access management UI: http://localhost:15672

### macOS
```bash
# Install using Homebrew
brew install rabbitmq

# Start service
brew services start rabbitmq

# Or run manually
rabbitmq-server
```

### Linux (Ubuntu/Debian)
```bash
# Install
sudo apt-get update
sudo apt-get install rabbitmq-server

# Start service
sudo systemctl start rabbitmq-server

# Enable auto-start
sudo systemctl enable rabbitmq-server

# Check status
sudo systemctl status rabbitmq-server
```

### Docker
```bash
# Run RabbitMQ in Docker
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# Access management UI: http://localhost:15672
# Default credentials: guest/guest
```

## Monitoring and Logs

### 1. RabbitMQ Logs
```bash
# Windows
# Check Event Viewer or RabbitMQ logs in installation directory

# macOS/Linux
sudo tail -f /var/log/rabbitmq/rabbit@hostname.log
```

### 2. Management UI
- URL: http://localhost:15672
- Default credentials: guest/guest
- Monitor connections, queues, and exchanges

### 3. Health Check
The application now includes a health check endpoint:
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "rabbitmq": "connected"
  }
}
```

## Performance Tuning

### 1. Connection Pool Settings
```javascript
// In rabbitmq.service.ts
const config = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  maxRetries: 5,
  retryDelay: 5000,
  heartbeat: 60
};
```

### 2. Queue Configuration
```javascript
// Durable queues with TTL
await channel.assertQueue('embedding_jobs', { 
  durable: true,
  arguments: {
    'x-message-ttl': 3600000, // 1 hour TTL
    'x-max-retries': 3
  }
});
```

### 3. Message Persistence
```javascript
// Messages are marked as persistent
channel.sendToQueue(queueName, message, {
  persistent: true
});
```

## Error Recovery

### 1. Automatic Reconnection
The service automatically attempts to reconnect with exponential backoff:
- Attempt 1: 5 seconds
- Attempt 2: 10 seconds
- Attempt 3: 20 seconds
- Attempt 4: 40 seconds
- Attempt 5: 80 seconds

### 2. Graceful Degradation
- Content creation/deletion continues even if RabbitMQ is unavailable
- Jobs are queued when connection is restored
- Error logging for debugging

### 3. Circuit Breaker Pattern
The service includes connection state checking:
```javascript
if (isRabbitMQConnected()) {
  // Send to queue
} else {
  // Log warning, continue without queue
}
```

## Testing Connection

### 1. Manual Test
```javascript
// Test script
const amqp = require('amqplib');

async function testConnection() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    console.log('✅ Connection successful');
    await connection.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

### 2. Health Check Script
```bash
# Check if RabbitMQ is responding
curl -u guest:guest http://localhost:15672/api/overview
```

## Common Commands

### RabbitMQ Management
```bash
# List queues
rabbitmqctl list_queues

# List connections
rabbitmqctl list_connections

# List exchanges
rabbitmqctl list_exchanges

# Purge queue
rabbitmqctl purge_queue embedding_jobs

# Stop RabbitMQ
rabbitmqctl stop
```

### Service Management
```bash
# Windows
net start RabbitMQ
net stop RabbitMQ

# macOS
brew services start rabbitmq
brew services stop rabbitmq

# Linux
sudo systemctl start rabbitmq-server
sudo systemctl stop rabbitmq-server
sudo systemctl restart rabbitmq-server
```

## Best Practices

1. **Always use durable queues** for important messages
2. **Set appropriate TTL** to prevent message buildup
3. **Monitor connection health** regularly
4. **Use connection pooling** for high-throughput applications
5. **Implement proper error handling** and logging
6. **Test reconnection scenarios** during development
7. **Use management UI** for monitoring and debugging

## Support

If you continue to experience issues:

1. Check RabbitMQ server logs
2. Verify network connectivity
3. Test with a simple connection script
4. Check system resources (memory, disk space)
5. Review firewall and security settings
6. Consider using Docker for consistent environment
