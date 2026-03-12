const mongoose = require("mongoose");

const ModerationCacheSchema = new mongoose.Schema({
  imageHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  cloudinaryUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ["approved", "rejected"],
    required: true,
  },
  reason: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("ModerationCache", ModerationCacheSchema);
