const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  targetType: {
    type: String,
    enum: ["Post", "Recipe"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "targetType",
  },
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);
