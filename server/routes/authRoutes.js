const express = require("express");
const { body } = require("express-validator");


const {
  loginLimiter,
  otpLimiter,
  forgotPasswordLimiter,
  registerLimiter,
  resetPasswordLimiter,
} = require("../middleware/rateLimiter");

const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

// Register
router.post(
  "/register",
  registerLimiter,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 50 })
      .withMessage("Name is too long"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be between 6 and 100 characters"),
  ],
  validateRequest,
  registerUser
);

// Login
router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  loginLimiter,
  validateRequest,
  loginUser
);

// Profile
router.get("/profile", protect, getProfile);

// Forgot Password
router.post(
  "/forgot-password",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
  ],
    forgotPasswordLimiter,
  validateRequest,
  forgotPassword
);

// Verify OTP
router.post(
  "/verify-otp",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),

    body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("OTP must be 6 digits"),
  ],
  otpLimiter,
  validateRequest,
  verifyOTP
);

// Reset Password
router.post(
  "/reset-password",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6, max: 100 })
      .withMessage("Password must be between 6 and 100 characters"),
  ],
  resetPasswordLimiter,
  validateRequest,
  resetPassword
);

module.exports = router;