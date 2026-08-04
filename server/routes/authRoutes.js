const express = require("express");
const { registerUser, loginUser, getProfile, forgotPassword, verifyOTP, resetPassword } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

console.log("Auth Routes Loaded");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

router.post("/forgot-password", forgotPassword);

router.post("/verify-otp", verifyOTP);

router.post("/reset-password", resetPassword);

module.exports = router;