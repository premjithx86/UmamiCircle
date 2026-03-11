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
