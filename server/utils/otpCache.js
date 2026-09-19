const { redisClient } = require("../config/redis");

async function setOTP(userId, hashedOTP) {
  const key = `otp:user:${userId}`;

  await redisClient.set(key, hashedOTP, {
    EX: 5 * 60,
  });
}

async function getOTP(userId) {
  const key = `otp:user:${userId}`;

  return await redisClient.get(key);
}

async function deleteOTP(userId) {
  const key = `otp:user:${userId}`;

  await redisClient.del(key);
}

module.exports = {
  setOTP,
  getOTP,
  deleteOTP,
};