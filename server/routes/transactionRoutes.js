const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTransaction,
  getSummary
} = require("../controllers/transactionController");

const router = express.Router();


router.get("/summary", protect, getSummary);
router.post("/", protect, addTransaction);
router.get("/", protect, getTransactions);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);


module.exports = router;