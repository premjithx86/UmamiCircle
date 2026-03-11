const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessage: {
    type: String,
    trim: true,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Validation to ensure at least 2 participants
ConversationSchema.path('participants').validate(function(value) {
  return value.length >= 2;
}, 'A conversation must have at least 2 participants.');

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = { Conversation };
