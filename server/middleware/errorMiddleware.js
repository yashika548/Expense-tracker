const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error("Server Error:", err.message);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image size must be less than 5 MB",
      });
    }

    return res.status(400).json({
      success: false,
      message: "File upload failed",
    });
  }

  // Custom file type error
  if (err.message === "Only JPG, PNG, and WEBP images are allowed") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : err.message,
  });
};

module.exports = errorHandler;