const bcrypt = require("bcrypt");
const {
    findUserByEmail,
    findUserById,
    createUser,
    updateUserOTP,
    updateUserPassword,
    markOTPVerified,
} = require("../repositories/userRepository");
const otpGenerator = require("otp-generator");
const transporter = require("../utils/sendEmail");

const {
  setOTP,
  getOTP,
  deleteOTP,
} = require("../utils/otpCache");

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

        const existingUser = await findUserByEmail(emailNormalized);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await createUser({
            name,
            email: emailNormalized,
            password: hashedPassword
        });

        console.log("POSTGRES REGISTER:", {
    id: user.id,
    email: user.email,
});

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user.id,
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
        const user = await findUserByEmail(emailNormalized);

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
                id: user.id
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
                id: user.id,
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

const user = await findUserById(req.user.id);

if (!user) {
    return res.status(404).json({
        success: false,
        message: "User not found",
    });
}

delete user.password;
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
    const user = await findUserByEmail(email);

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

await setOTP(user.id, hashedOTP);

await updateUserOTP(
    user.id,
    null,
    null,
    false
);

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

const user = await findUserByEmail(
    email?.trim().toLowerCase()
);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storedOTP = await getOTP(user.id);

if (!storedOTP) {
  return res.status(400).json({
    success: false,
    message: "OTP expired or not found. Please request a new OTP",
  });
}

const isOTPValid = await bcrypt.compare(otp, storedOTP);

if (!isOTPValid) {
  return res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
}

await deleteOTP(user.id);

await markOTPVerified(user.id);


 

if (!isOTPValid) {
  return res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
}

    
    await markOTPVerified(user.id); 

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

    const user = await findUserByEmail(
    email.trim().toLowerCase()
);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp_verified) {
      return res.status(401).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    

    const hashedPassword = await bcrypt.hash(password, 10);

   await updateUserPassword(
    user.id,
    hashedPassword
);

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