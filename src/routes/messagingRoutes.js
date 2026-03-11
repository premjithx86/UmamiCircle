const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { authMiddleware } = require("../middleware/auth");

/**
 * Get or create a conversation with a participant
 */
router.post("/conversations", authMiddleware, async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const otherUser = await User.findById(participantId);
    if (!otherUser) return res.status(404).json({ error: "Participant not found" });

    // Check for blocks
    if (currentUser.blocked.includes(participantId)) {
      return res.status(400).json({ error: "You have blocked this user" });
    }
    if (otherUser.blocked.includes(currentUser._id)) {
      return res.status(400).json({ error: "Cannot start conversation with this user" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUser._id, participantId], $size: 2 }
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
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const conversations = await Conversation.find({
      participants: currentUser._id
    })
    .populate("participants", "username avatar name")
    .sort({ lastMessageAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send a message
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const conversation = await Conversation.findById(conversationId).populate("participants");
    if (!conversation) return res.status(404).json({ error: "Conversation not found" });

    if (!conversation.participants.some(p => p._id.toString() === currentUser._id.toString())) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Check if any other participant has blocked the current user or vice versa
    const otherParticipant = conversation.participants.find(p => p._id.toString() !== currentUser._id.toString());
    if (otherParticipant) {
      if (currentUser.blocked.includes(otherParticipant._id)) {
        return res.status(400).json({ error: "You have blocked this user" });
      }
      if (otherParticipant.blocked.includes(currentUser._id)) {
        return res.status(400).json({ error: "You are blocked by this user" });
      }
    }

    const message = new Message({
      conversationId,
      sender: currentUser._id,
      content,
    });

    await message.save();

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageAt: Date.now(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get messages for a specific conversation
 */
router.get("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(currentUser._id)) {
      return res.status(403).json({ error: "Unauthorized access to conversation" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "username avatar")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
