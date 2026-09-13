const bcrypt = require("bcrypt");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const transporter = require("../utils/sendEmail");

const registerUser = async (req, res) => {
     try {

        const { name, password } = req.body;
const emailNormalized = req.body.email?.trim().toLowerCase();

        if (!name || !emailNormalized || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email: emailNormalized });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: emailNormalized,
            password: hashedPassword
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
    try {

const emailNormalized = req.body.email?.trim().toLowerCase();
const { password } = req.body;        

        // Validation
        if (!emailNormalized || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Find user
        const user = await User.findOne({ email: emailNormalized });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};

const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    // Check Email
    const user = await User.findOne({ email });

    if (!user) {
  return res.status(200).json({
    success: true,
    message: "If an account exists, an OTP has been sent.",
  });
}

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Save OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

user.otp = hashedOTP;
user.otpExpire = Date.now() + 5 * 60 * 1000;
user.otpVerified = false;

    await user.save();

    // Send Email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Expense Tracker Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email?.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp) {
  return res.status(400).json({
    success: false,
    message: "No active OTP. Please request a new OTP",
  });
}

    const isOTPValid = await bcrypt.compare(otp, user.otp);

if (!isOTPValid) {
  return res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
}

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }
    user.otpVerified = true;
    await user.save(); 

    res.status(200).json({
      success: true,
      message: "OTP Verified",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};



const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otpVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "OTP expired. Please request a new OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpire = null;
    user.otpVerified = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password Reset Successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    forgotPassword,
  verifyOTP,
  resetPassword,
};