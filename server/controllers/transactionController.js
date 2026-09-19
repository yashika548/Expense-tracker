const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const { publishEvent } = require("../utils/redisPubSub");

const {
  createTransaction,
  findTransactions: findTransactionsRepository,
  deleteTransaction: deleteTransactionRepository,
  updateTransaction: updateTransactionRepository,
  getTransactionSummary,
} = require("../repositories/transactionRepository");

const {
  getCache,
  setCache,
  invalidateUserSummary,
  invalidateUserTransactions,
} = require("../utils/cache");



// ===============================
// ADD TRANSACTION
// ===============================

const addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, note, date } = req.body;

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot be negative",
      });
    }

    const transaction = await createTransaction({
      userId: req.user.id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      note: note?.trim() || "",
      date: date || new Date(),
    });

  try {
  await publishEvent("transaction.created", {
    userId: req.user.id,
    transactionId: transaction.id,
    amount: transaction.amount,
    type: transaction.type,
  });
} catch (error) {
  console.error(
    "Redis Pub/Sub publish failed:",
    error.message
  );
}

    await invalidateUserSummary(req.user.id);
    await invalidateUserTransactions(req.user.id);

    res.status(201).json({
      success: true,
      message: "Transaction Added Successfully",
      transaction,
    });

  } catch (error) {
    console.error("Add transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





// ===============================
// GET TRANSACTIONS
// ===============================
// ===============================
// GET TRANSACTIONS
// ===============================
const { acquireLock, releaseLock } = require("../utils/redisLock");

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getTransactions = async (req, res) => {
  let lockKey = null;
  let lockToken = null;

  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const { search, category, type } = req.query;

    const cacheKey = [
      `transactions:user:${req.user.id}`,
      `page=${page}`,
      `limit=${limit}`,
      `search=${search || ""}`,
      `category=${category || ""}`,
      `type=${type || ""}`,
    ].join(":");

    // 1. First Redis check
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      console.log("Transactions served from Redis");

      return res.status(200).json({
        success: true,
        ...cachedData,
        source: "redis",
      });
    }

    console.log("Cache MISS");

    // 2. Try to acquire distributed lock
    lockKey = `lock:${cacheKey}`;

    try {
  lockToken = await acquireLock(lockKey, 10);
} catch (error) {
  console.error(
    "Redis lock unavailable:",
    error.message
  );

  lockToken = null;
}

    // ------------------------------------------------
    // CASE A: We acquired the lock
    // ------------------------------------------------
    if (lockToken) {
      console.log("Redis lock acquired");

      // Double-check cache after acquiring lock
      const freshCache = await getCache(cacheKey);

      if (freshCache) {
        console.log(
          "Cache populated while acquiring lock"
        );

        return res.status(200).json({
          success: true,
          ...freshCache,
          source: "redis",
        });
      }

      // Cache is genuinely missing.
      console.log(
        "Lock owner querying PostgreSQL"
      );

      const { transactions, total } =
        await findTransactionsRepository({
          userId: req.user.id,
          search,
          category,
          type,
          limit,
          skip,
        });

      const responseData = {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Populate Redis
      await setCache(cacheKey, responseData, 60);

      console.log(
        "Cache populated by lock owner"
      );

      return res.status(200).json({
        success: true,
        ...responseData,
        source: "postgresql",
      });
    }

    // ------------------------------------------------
    // CASE B: Another request owns the lock
    // ------------------------------------------------
    console.log(
      "Another request owns the lock - waiting..."
    );

    // Retry a few times
    for (let attempt = 1; attempt <= 5; attempt++) {
      await sleep(100);

      const retryData = await getCache(cacheKey);

      if (retryData) {
        console.log(
          `Cache populated after ${attempt} retry(s)`
        );

        return res.status(200).json({
          success: true,
          ...retryData,
          source: "redis",
        });
      }
    }

    // ------------------------------------------------
    // CASE C: Lock owner failed / took too long
    // ------------------------------------------------
    console.log(
      "Cache still unavailable after retries - querying PostgreSQL"
    );

    const { transactions, total } =
      await findTransactionsRepository({
        userId: req.user.id,
        search,
        category,
        type,
        limit,
        skip,
      });

    const responseData = {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await setCache(cacheKey, responseData, 60);

    return res.status(200).json({
      success: true,
      ...responseData,
      source: "postgresql",
    });

  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  } finally {
    // VERY IMPORTANT:
    // Only the request that actually acquired the lock
    // is allowed to release it.
    if (lockKey && lockToken) {
      await releaseLock(lockKey, lockToken).catch((error) => {
        console.error(
          "Redis lock release error:",
          error
        );
      });

      console.log("Redis lock released");
    }
  }
};


// ===============================
// DELETE TRANSACTION
// ===============================
// ===============================
// DELETE TRANSACTION
// ===============================
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // PostgreSQL UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await deleteTransactionRepository(
      id,
      req.user.id
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await invalidateUserSummary(req.user.id);
    await invalidateUserTransactions(req.user.id);
    res.status(200).json({
      success: true,
      message: "Transaction Deleted Successfully",
    });

  } catch (error) {
    console.error("Delete transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ===============================
// UPDATE TRANSACTION
// ===============================
// ===============================
// UPDATE TRANSACTION
// ===============================
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // PostgreSQL UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const { title, amount, type, category, note, date } = req.body;

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot be negative",
      });
    }

    const updated = await updateTransactionRepository(
      id,
      req.user.id,
      {
        title: title.trim(),
        amount: Number(amount),
        type,
        category: category.trim(),
        note: note?.trim() || "",
        date: date || new Date(),
      }
    );


    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }
        await invalidateUserSummary(req.user.id);
    await invalidateUserTransactions(req.user.id);


    res.status(200).json({
      success: true,
      message: "Transaction Updated Successfully",
      transaction: updated,
    });

  } catch (error) {
    console.error("Update transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ===============================
// GET SUMMARY
// ===============================
const getSummary = async (req, res) => {
  try {
    const cacheKey = `summary:user:${req.user.id}`;

    const cachedSummary = await getCache(cacheKey);

    if (cachedSummary) {
      console.log("Summary served from Redis");

      return res.status(200).json({
        success: true,
        ...cachedSummary,
        source: "redis",
      });
    }

    console.log("Summary cache miss - querying PostgreSQL");

    const summary = await getTransactionSummary(req.user.id);

    await setCache(cacheKey, summary, 300);

    return res.status(200).json({
      success: true,
      ...summary,
      source: "postgresql",
    });
  } catch (error) {
    console.error("Get summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSummary,
};