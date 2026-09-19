const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Security headers
app.use(helmet());

// Production CORS
const normalizedClientUrl = process.env.CLIENT_URL
  ?.trim()
  .replace(/\/$/, "");

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  normalizedClientUrl,
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return /^https:\/\/expense-tracker(?:-[a-z0-9-]+)?-yashika11\.vercel\.app$/i.test(
    origin
  );
};

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
// Request body limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/user", userRoutes);

// Health/Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense Tracker API is running",
  });
});

module.exports = app;