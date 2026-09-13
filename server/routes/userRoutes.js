const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const { uploadProfileImage, updateBudget } = require("../controllers/userController");
const { getProfile } = require("../controllers/authController");

router.post(
  "/profile-image",
  protect,
  upload.single("profileImage"),
  uploadProfileImage
);
router.put(
  "/budget",
  protect,
  updateBudget
);

router.get("/profile", protect, getProfile);

module.exports = router;