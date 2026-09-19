require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const { connectRedis } = require("./config/redis");
const { connectPubSub } = require("./utils/redisPubSub");

const {
  startTransactionEventListener,
} = require("./events/transactionEvents");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectPubSub();
    await connectRedis();
    await startTransactionEventListener();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});