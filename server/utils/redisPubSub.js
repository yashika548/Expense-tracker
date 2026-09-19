const { createClient } = require("redis");

const redisPublisher = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  },
});

const redisSubscriber = redisPublisher.duplicate();

redisPublisher.on("error", (error) => {
  console.error("Redis Publisher Error:", error);
});

redisSubscriber.on("error", (error) => {
  console.error("Redis Subscriber Error:", error);
});

async function connectPubSub() {
  if (!redisPublisher.isOpen) {
    await redisPublisher.connect();
  }

  if (!redisSubscriber.isOpen) {
    await redisSubscriber.connect();
  }

  console.log("Redis Pub/Sub connected");
}

async function publishEvent(channel, data) {
  if (!redisPublisher.isOpen) {
    await redisPublisher.connect();
  }

  await redisPublisher.publish(
    channel,
    JSON.stringify(data)
  );
}

async function subscribeToChannel(channel, handler) {
  if (!redisSubscriber.isOpen) {
    await redisSubscriber.connect();
  }

  await redisSubscriber.subscribe(channel, (message) => {
    try {
      const data = JSON.parse(message);
      handler(data);
    } catch (error) {
      console.error(
        "Redis Pub/Sub message error:",
        error
      );
    }
  });
}

module.exports = {
  connectPubSub,
  publishEvent,
  subscribeToChannel,
};