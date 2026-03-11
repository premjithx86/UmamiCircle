const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

/**
 * Get all notifications for the current user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const userDoc = await User.findOne({ firebaseUID: currentUid });
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    const notifications = await Notification.find({ user: userDoc._id })
      .populate("actor", "username avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mark a specific notification as read
 */
router.put("/read/:id", authMiddleware, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userDoc._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Mark all notifications as read for the current user
 */
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    const currentUid = req.user.uid;
    const userDoc = await User.findOne({ firebaseUID: currentUid });
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    await Notification.updateMany(
      { user: userDoc._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
