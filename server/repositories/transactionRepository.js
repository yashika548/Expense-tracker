
const pool = require("../config/dbPostgres");

// ===============================
// CREATE TRANSACTION
// ===============================
async function createTransaction({
  userId,
  title,
  amount,
  type,
  category,
  note,
  date,
}) {
  const result = await pool.query(
    `
    INSERT INTO transactions (
      user_id,
      title,
      amount,
      type,
      category,
      note,
      date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `,
    [userId, title, amount, type, category, note, date]
  );

  return result.rows[0];
}


// ===============================
// GET TRANSACTIONS
// ===============================
async function findTransactions({
  userId,
  search,
  category,
  type,
  limit,
  skip,
}) {
  const conditions = ["user_id = $1"];
  const values = [userId];

  let parameterIndex = 2;

  if (search) {
    conditions.push(`
      (
        title ILIKE $${parameterIndex}
        OR category ILIKE $${parameterIndex}
        OR note ILIKE $${parameterIndex}
      )
    `);

    values.push(`%${search}%`);
    parameterIndex++;
  }

  if (category && category !== "All") {
    conditions.push(`category = $${parameterIndex}`);
    values.push(category);
    parameterIndex++;
  }

  if (type && ["income", "expense"].includes(type)) {
    conditions.push(`type = $${parameterIndex}`);
    values.push(type);
    parameterIndex++;
  }

  const whereClause = conditions.join(" AND ");

  const transactionsQuery = `
    SELECT *
    FROM transactions
    WHERE ${whereClause}
    ORDER BY date DESC
    LIMIT $${parameterIndex}
    OFFSET $${parameterIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM transactions
    WHERE ${whereClause}
  `;

  const transactionValues = [
    ...values,
    limit,
    skip,
  ];

  const [transactionsResult, countResult] = await Promise.all([
    pool.query(transactionsQuery, transactionValues),
    pool.query(countQuery, values),
  ]);

  return {
    transactions: transactionsResult.rows,
    total: Number(countResult.rows[0].total),
  };
}


// ===============================
// DELETE TRANSACTION
// ===============================
async function deleteTransaction(id, userId) {
  const result = await pool.query(
    `
    DELETE FROM transactions
    WHERE id = $1
      AND user_id = $2
    RETURNING *
    `,
    [id, userId]
  );

  return result.rows[0] || null;
}


// ===============================
// UPDATE TRANSACTION
// ===============================
async function updateTransaction(
  id,
  userId,
  {
    title,
    amount,
    type,
    category,
    note,
    date,
  }
) {
  const result = await pool.query(
    `
    UPDATE transactions
    SET
      title = $1,
      amount = $2,
      type = $3,
      category = $4,
      note = $5,
      date = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
      AND user_id = $8
    RETURNING *
    `,
    [
      title,
      amount,
      type,
      category,
      note,
      date,
      id,
      userId,
    ]
  );

  return result.rows[0] || null;
}


// ===============================
// GET SUMMARY
// ===============================
async function getTransactionSummary(userId) {
  const result = await pool.query(
    `
    SELECT
      COALESCE(
        SUM(amount) FILTER (WHERE type = 'income'),
        0
      ) AS total_income,

      COALESCE(
        SUM(amount) FILTER (WHERE type = 'expense'),
        0
      ) AS total_expense,

      COUNT(*) AS total_transactions

    FROM transactions
    WHERE user_id = $1
    `,
    [userId]
  );

  const row = result.rows[0];

  const totalIncome = Number(row.total_income);
  const totalExpense = Number(row.total_expense);
  const totalTransactions = Number(row.total_transactions);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    totalTransactions,
  };
}


module.exports = {
  createTransaction,
  findTransactions,
  deleteTransaction,
  updateTransaction,
  getTransactionSummary,
};
