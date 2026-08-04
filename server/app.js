const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Register Routes
app.use("/api/auth", authRoutes);

// transaction routes
app.use("/api/transactions", transactionRoutes);

app.use("/api/user", userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Expense Tracker API is running 🚀");
});

module.exports = app;