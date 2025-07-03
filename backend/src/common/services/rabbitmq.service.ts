import ampq from 'amqplib';

let channel: ampq.Channel | null = null;
export const connectRabbitMQ = async () => {
  try {
    const connection = await ampq.connect( 'amqp://localhost');
    channel = await connection.createChannel();
    await channel.assertQueue('embedding_jobs', { durable: true });
    console.log('✅ RabbitMQ connected successfully');
  } catch (error) {
    console.error('❌ Error connecting to RabbitMQ:', error);
    throw error;
  }
};

export const getChannel = () => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
};
