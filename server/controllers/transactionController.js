const Transaction = require("../models/Transaction");

const addTransaction = async (req, res) => {
    try {

        const { title, amount, type, category, note, date } = req.body;

        // Validation
        if (!title || !amount || !type || !category) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields"
            });
        }

        // Create Transaction
        const transaction = await Transaction.create({
            user: req.user.id,
            title,
            amount,
            type,
            category,
            note,
            date
        });

        res.status(201).json({
            success: true,
            message: "Transaction Added Successfully",
            transaction
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


const getTransactions = async (req, res) => {
    try {

        const transactions = await Transaction.find({
            user: req.user.id
        }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


const deleteTransaction = async (req, res) => {
    try {

        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }

        // Check ownership
        if (transaction.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Not Authorized"
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            success: true,
            message: "Transaction Deleted Successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const getSummary = async (req, res) => {
    try {

        const transactions = await Transaction.find({
            user: req.user.id
        });

        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach((transaction) => {

            if (transaction.type === "income") {
                totalIncome += transaction.amount;
            } else {
                totalExpense += transaction.amount;
            }

        });

        const balance = totalIncome - totalExpense;

        res.status(200).json({
            success: true,
            totalIncome,
            totalExpense,
            balance,
            totalTransactions: transactions.length
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      transaction: updated,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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