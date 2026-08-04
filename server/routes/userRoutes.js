const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const upload = require("../middleware/upload");

const { uploadProfile } = require("../controllers/userController");
const { getProfile } = require("../controllers/authController");

router.put(
  "/upload-profile",
  protect,
  upload.single("image"),
  uploadProfile
);

router.get("/profile", protect, getProfile);

module.exports = router;