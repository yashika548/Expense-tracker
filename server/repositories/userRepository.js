const pool = require("../config/dbPostgres");

async function findUserByEmail(email) {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function createUser({
  name,
  email,
  password,
  budget = 0,
}) {
  const result = await pool.query(
    `
    INSERT INTO users (name, email, password, budget)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [name, email, password, budget]
  );

  return result.rows[0];
}

async function updateUserOTP(id, otp, otpExpire, otpVerified) {
  const result = await pool.query(
    `
    UPDATE users
    SET
      otp = $1,
      otp_expire = $2,
      otp_verified = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
    `,
    [otp, otpExpire, otpVerified, id]
  );

  return result.rows[0] || null;
}

async function updateUserPassword(id, password) {
  const result = await pool.query(
    `
    UPDATE users
    SET
      password = $1,
      otp = NULL,
      otp_expire = NULL,
      otp_verified = FALSE,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
    `,
    [password, id]
  );

  return result.rows[0] || null;
}

async function markOTPVerified(id) {
  const result = await pool.query(
    `
    UPDATE users
    SET
      otp_verified = TRUE,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserOTP,
  updateUserPassword,
  markOTPVerified,
};