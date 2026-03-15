const mongoose = require("mongoose");

const AIChatUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
    index: true,
  },
  count: {
    type: Number,
    default: 0,
  }
});

// Compound index to quickly find usage for a user on a specific date
AIChatUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AIChatUsage", AIChatUsageSchema);
