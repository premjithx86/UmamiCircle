const mongoose = require("mongoose");

/**
 * Model to track blocked user sessions for immediate force-logout.
 * Entries should be cleaned up periodically or have a TTL if using Redis.
 * In MongoDB, we can use a TTL index.
 */
const BlockedSessionSchema = new mongoose.Schema({
  firebaseUID: {
    type: String,
    required: true,
    index: true,
  },
  blockedAt: {
    type: Date,
    default: Date.now,
    expires: 86400 * 7, // Automatically delete after 7 days (session duration)
  }
});

module.exports = mongoose.model("BlockedSession", BlockedSessionSchema);
