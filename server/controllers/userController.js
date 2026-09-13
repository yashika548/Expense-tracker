const User = require("../models/User");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required",
      });
    }

    const oldUser = await User.findById(req.user.id).select(
      "profileImagePublicId"
    );

    if (!oldUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload new image first
    const result = await uploadToCloudinary(
      req.file.buffer,
      "expense-tracker/profiles"
    );

    // Update database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profileImage: result.secure_url,
        profileImagePublicId: result.public_id,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -otp -otpExpire -otpVerified");

    // Delete old Cloudinary image after successful update
    if (oldUser.profileImagePublicId) {
      try {
        const cloudinary = require("../config/cloudinary");

        await cloudinary.uploader.destroy(
          oldUser.profileImagePublicId
        );
      } catch (deleteError) {
        console.error(
          "Old profile image deletion failed:",
          deleteError.message
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      user,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload profile image",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpire -otpVerified"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const budget = Number(req.body.budget);

    if (!Number.isFinite(budget) || budget < 0) {
      return res.status(400).json({
        success: false,
        message: "Budget must be a valid non-negative number",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        budget,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -otp -otpExpire -otpVerified");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      budget: user.budget,
    });
  } catch (error) {
    console.error("Update budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update budget",
    });
  }
};

module.exports = {
  uploadProfileImage,
  getProfile,
  updateBudget,
};