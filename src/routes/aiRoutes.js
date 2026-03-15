const express = require("express");
const router = express.Router();
const AIChatUsage = require("../models/AIChatUsage");
const AIChatHistory = require("../models/AIChatHistory");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");
const { getAIChatResponse } = require("../services/aiService");

/**
 * @route POST /api/ai/chat
 * @desc Chat with UmamiBot AI cooking assistant
 * @access Private
 */
router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, historyId } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const currentUid = req.user.uid;
    const user = await User.findOne({ firebaseUID: currentUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = new Date().toISOString().split('T')[0];
    const LIMIT = 5;

    // Check usage
    let usage = await AIChatUsage.findOne({ userId: user._id, date: today });
    if (!usage) {
      usage = new AIChatUsage({ userId: user._id, date: today, count: 0 });
    }

    if (usage.count >= LIMIT) {
      return res.status(429).json({ 
        error: "You have reached your daily limit of 5 messages. Come back tomorrow!",
        messagesUsed: usage.count,
        messagesRemaining: 0
      });
    }

    // Call AI
    const reply = await getAIChatResponse(message);

    // Increment usage
    usage.count += 1;
    await usage.save();

    // Save to history
    let history;
    if (historyId) {
      history = await AIChatHistory.findOne({ _id: historyId, userId: user._id });
      if (history) {
        history.messages.push({ role: "user", content: message });
        history.messages.push({ role: "ai", content: reply });
        await history.save();
      }
    }

    if (!history) {
      // Create new history entry
      const title = message.substring(0, 40) + (message.length > 40 ? "..." : "");
      history = new AIChatHistory({
        userId: user._id,
        title,
        messages: [
          { role: "user", content: message },
          { role: "ai", content: reply }
        ]
      });
      await history.save();
    }

    res.status(200).json({
      reply,
      messagesUsed: usage.count,
      messagesRemaining: LIMIT - usage.count,
      historyId: history._id
    });
  } catch (error) {
    console.error("AI Chat Route Error:", error);
    res.status(500).json({ error: "UmamiBot is currently unavailable. Please try again later." });
  }
});

/**
 * @route GET /api/ai/history
 * @desc Get user's chat history list
 * @access Private
 */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const user = await User.findOne({ firebaseUID: currentUid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const history = await AIChatHistory.find({ userId: user._id })
      .select("title createdAt updatedAt messages")
      .sort({ updatedAt: -1 });

    const formattedHistory = history.map(h => ({
      _id: h._id,
      title: h.title,
      date: h.updatedAt,
      messageCount: h.messages.length
    }));

    res.status(200).json(formattedHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/ai/history/:id
 * @desc Get specific chat history details
 * @access Private
 */
router.get("/history/:id", authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const user = await User.findOne({ firebaseUID: currentUid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const history = await AIChatHistory.findOne({ _id: req.params.id, userId: user._id });
    if (!history) return res.status(404).json({ error: "Chat history not found" });

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/ai/history/:id
 * @desc Delete a chat history entry
 * @access Private
 */
router.delete("/history/:id", authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const user = await User.findOne({ firebaseUID: currentUid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const history = await AIChatHistory.findOneAndDelete({ _id: req.params.id, userId: user._id });
    if (!history) return res.status(404).json({ error: "Chat history not found" });

    res.status(200).json({ message: "Chat history deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/ai/usage
 * @desc Get current daily usage for AI chat
 * @access Private
 */
router.get("/usage", authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const user = await User.findOne({ firebaseUID: currentUid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = new Date().toISOString().split('T')[0];
    const usage = await AIChatUsage.findOne({ userId: user._id, date: today });
    
    res.status(200).json({
      messagesUsed: usage ? usage.count : 0,
      messagesRemaining: 5 - (usage ? usage.count : 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
