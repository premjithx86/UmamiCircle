const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  country: {
    type: String,
  },
  bio: {
    type: String,
    default: "",
  },
  profilePicUrl: {
    type: String,
    default: "",
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  blocked: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  isBlocked: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
