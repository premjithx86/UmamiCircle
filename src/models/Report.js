const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  targetType: {
    type: String,
    enum: ["User", "Post", "Recipe", "Comment"],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "targetType",
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed", "action_taken"],
    default: "pending",
  },
  adminComment: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Report", ReportSchema);
