const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Conversation } = require('../models/Conversation');
const { Message } = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');
const { emitNewMessage } = require('../services/messagingService');
const { createNotification } = require('../services/notificationService');

/**
 * Get or create a conversation with a participant
 */
router.post('/conversations', authMiddleware, async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const otherUser = await User.findById(participantId);
    if (!otherUser) return res.status(404).json({ error: 'Participant not found' });

    // Check for blocks
    if (currentUser.blocked.includes(participantId)) {
      return res.status(400).json({ error: 'You have blocked this user' });
    }
    if (otherUser.blocked.includes(currentUser._id)) {
      return res.status(400).json({ error: 'Cannot start conversation with this user' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser._id, participantId], $size: 2 },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [currentUser._id, participantId],
      });
      await conversation.save();
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all conversations for the current user
 */
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const conversations = await Conversation.find({
      participants: currentUser._id,
    })
    .populate('participants', 'username avatar name profilePicUrl blocked')
    .sort({ lastMessageAt: -1 });

    // Mark if the current user is blocked by the other participant or vice versa
    const enhancedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(p => p._id.toString() !== currentUser._id.toString());
      const isBlockedByMe = currentUser.blocked.includes(otherParticipant?._id);
      const isBlockingMe = otherParticipant?.blocked.includes(currentUser._id);
      
      return {
        ...conv.toObject(),
        isBlocked: isBlockedByMe || isBlockingMe,
        blockType: isBlockedByMe ? 'you_blocked' : (isBlockingMe ? 'they_blocked' : null)
      };
    });

    res.status(200).json(enhancedConversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send a message
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const conversation = await Conversation.findById(conversationId).populate('participants');
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    if (!conversation.participants.some(p => p._id.toString() === currentUser._id.toString())) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if any other participant has blocked the current user or vice versa
    const otherParticipant = conversation.participants.find(p => p._id.toString() !== currentUser._id.toString());
    if (otherParticipant) {
      if (currentUser.blocked.includes(otherParticipant._id)) {
        return res.status(400).json({ error: 'You have blocked this user' });
      }
      if (otherParticipant.blocked.includes(currentUser._id)) {
        return res.status(400).json({ error: 'You are blocked by this user' });
      }
    }

    const message = new Message({
      conversationId,
      sender: currentUser._id,
      content,
    });

    await message.save();

    // Update conversation last message and increment unread count for others
    const updateQuery = {
      lastMessage: content,
      lastMessageAt: Date.now(),
    };

    if (otherParticipant) {
      updateQuery[`unreadCounts.${otherParticipant._id}`] = (conversation.unreadCounts?.get(otherParticipant._id.toString()) || 0) + 1;
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: content,
        lastMessageAt: Date.now(),
      },
      $inc: {
        [`unreadCounts.${otherParticipant._id}`]: 1
      }
    });

    // Populate sender info for frontend
    const populatedMessage = await Message.findById(message._id).populate('sender', 'username name profilePicUrl');

    // Emit real-time event
    emitNewMessage(conversationId, populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mark conversation as read
 */
router.put('/conversations/:conversationId/read', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCounts.${currentUser._id}`]: 0 }
    });

    // Also mark individual messages as read
    await Message.updateMany(
      { conversationId, sender: { $ne: currentUser._id }, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'Conversation marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a message
 */
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // Only sender can delete their message
    if (message.sender.toString() !== currentUser._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized to delete this message' });
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get messages for a specific conversation
 */
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(currentUser._id)) {
      return res.status(403).json({ error: 'Unauthorized access to conversation' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'username name profilePicUrl')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { messagingRouter: router };
