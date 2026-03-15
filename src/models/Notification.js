const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for system notifications
  },
  type: {
    type: String,
    enum: ["like", "comment", "follow", "mention", "report_update", "message", "system"],
    required: true,
  },
  targetType: {
    type: String,
    enum: ["Post", "Recipe", "User", "Comment", "Conversation"],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "targetType",
  },
  content: {
    type: String, // For custom system messages
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
