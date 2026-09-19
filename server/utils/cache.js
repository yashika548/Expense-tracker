const { redisClient } = require("../config/redis");

async function getCache(key) {
  try {
    const data = await redisClient.get(key);

    console.log("[REDIS GET]", {
      key,
      found: !!data,
    });

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("[REDIS GET ERROR]", error.message);

    // Redis failure should behave like a cache miss
    return null;
  }
}

async function setCache(key, data, ttl = 60) {
  try {
    const jitter = Math.floor(Math.random() * 10);
    const finalTTL = ttl + jitter;

    await redisClient.set(key, JSON.stringify(data), {
      EX: finalTTL,
    });

    const exists = await redisClient.exists(key);
    const remainingTTL = await redisClient.ttl(key);

    console.log("[REDIS SET]", {
      key,
      exists,
      ttl: remainingTTL,
      baseTTL: ttl,
      jitter,
    });
  } catch (error) {
    console.error("[REDIS SET ERROR]", error.message);

    // Do not fail the API request because cache write failed
  }
}

async function deleteCache(key) {
  try {
    const deleted = await redisClient.del(key);

    console.log("[REDIS DELETE]", {
      key,
      deleted,
    });
  } catch (error) {
    console.error(
      "[REDIS DELETE ERROR]",
      error.message
    );
  }
}

async function invalidateUserSummary(userId) {
  await deleteCache(`summary:user:${userId}`);
}

async function invalidateUserTransactions(userId) {
  const pattern = `transactions:user:${userId}:*`;

  let cursor = "0";
  const keys = [];

  do {
    const result = await redisClient.scan(cursor, {
      MATCH: pattern,
      COUNT: 100,
    });

    cursor = result.cursor;
    keys.push(...result.keys);
  } while (cursor !== "0");

  console.log("[REDIS SCAN] Found keys:", keys);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  console.log("[REDIS INVALIDATE TRANSACTIONS]", {
    userId,
    deleted: keys.length,
  });
}

module.exports = {
  getCache,
  setCache,
  deleteCache,
  invalidateUserSummary,
  invalidateUserTransactions,
};