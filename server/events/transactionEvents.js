const {
  subscribeToChannel,
} = require("../utils/redisPubSub");

const {
  invalidateUserSummary,
  invalidateUserTransactions,
} = require("../utils/cache");

async function startTransactionEventListener() {
  await subscribeToChannel(
    "transaction.created",
    async (data) => {
      console.log(
        "📢 Transaction Created Event:",
        data
      );

      await invalidateUserSummary(data.userId);
      await invalidateUserTransactions(data.userId);

      console.log(
        "🧹 Transaction caches invalidated through Pub/Sub"
      );
    }
  );
}

module.exports = {
  startTransactionEventListener,
};