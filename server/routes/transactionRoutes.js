const express = require("express");
const { body } = require("express-validator");

const protect = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSummary,
} = require("../controllers/transactionController");

const router = express.Router();

const transactionValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title is too long"),

  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a valid non-negative number"),

  body("type")
    .isIn(["income", "expense"])
    .withMessage("Invalid transaction type"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isLength({ max: 50 })
    .withMessage("Category is too long"),

  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note is too long"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date"),
];

// Summary
router.get("/summary", protect, getSummary);

// Add transaction
router.post(
  "/",
  protect,
  transactionValidation,
  validateRequest,
  addTransaction
);

// Get transactions
router.get("/", protect, getTransactions);

// Update transaction
router.put(
  "/:id",
  protect,
  transactionValidation,
  validateRequest,
  updateTransaction
);

// Delete transaction
router.delete("/:id", protect, deleteTransaction);

module.exports = router;