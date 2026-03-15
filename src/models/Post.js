const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  caption: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imageHash: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  moderationStatus: {
    type: String,
    enum: ["pending", "approved", "flagged"],
    default: "pending",
  },
  isHidden: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Post", PostSchema);
