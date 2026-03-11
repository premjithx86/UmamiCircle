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
    required: true,
  },
  type: {
    type: String,
    enum: ["like", "comment", "follow", "mention", "report_update"],
    required: true,
  },
  targetType: {
    type: String,
    enum: ["Post", "Recipe", "User", "Comment"],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "targetType",
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
