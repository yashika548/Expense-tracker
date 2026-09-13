const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    budget: {
  type: Number,
  default: 0,
  min: 0,
},

    profilePic: {
    type: String,
    default: "",
},

profileImage: {
  type: String,
  default: "",
  trim: true,
},

profileImagePublicId: {
  type: String,
  default: "",
  trim: true,
},


    otp: {
    type: String,
},

otpExpire: {
    type: Date,
},
otpVerified: {
  type: Boolean,
  default: false,
},


  },
  {
    timestamps: true,
  }

  
  
);

module.exports = mongoose.model("User", userSchema);