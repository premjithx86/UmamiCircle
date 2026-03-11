const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Report = require("../models/Report");
const { authMiddleware } = require("../middleware/auth");

/**
 * Follow a user
 */
router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUid = req.user.uid;

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findOne({ firebaseUID: currentUid });

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (currentUser._id.toString() === targetUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Check for blocks
    if (currentUser.blocked.includes(targetUserId)) {
      return res.status(400).json({ error: "Unblock user first to follow" });
    }
    if (userToFollow.blocked.includes(currentUser._id)) {
      return res.status(400).json({ error: "Cannot follow this user" });
    }

    // Update following list of current user
    if (!currentUser.following.includes(targetUserId)) {
      currentUser.following.push(targetUserId);
      await currentUser.save();
    }

    // Update followers list of target user
    if (!userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.push(currentUser._id);
      await userToFollow.save();
    }

    res.status(200).json({ message: "Successfully followed user" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Unfollow a user
 */
router.post("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUid = req.user.uid;

    const userToUnfollow = await User.findById(targetUserId);
    const currentUser = await User.findOne({ firebaseUID: currentUid });

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from following list of current user
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    await currentUser.save();

    // Remove from followers list of target user
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();

    res.status(200).json({ message: "Successfully unfollowed user" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Block a user
 */
router.post("/block/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    if (currentUser._id.toString() === targetUserId) {
      return res.status(400).json({ error: "You cannot block yourself" });
    }

    if (!currentUser.blocked.includes(targetUserId)) {
      currentUser.blocked.push(targetUserId);
      
      // Auto-unfollow when blocking
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      await currentUser.save();

      // Also remove current user from target's following if they followed
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { following: currentUser._id, followers: currentUser._id }
      });
    }

    res.status(200).json({ message: "User blocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Unblock a user
 */
router.post("/unblock/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUid = req.user.uid;

    const currentUser = await User.findOne({ firebaseUID: currentUid });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    currentUser.blocked = currentUser.blocked.filter(id => id.toString() !== targetUserId);
    await currentUser.save();

    res.status(200).json({ message: "User unblocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Report content or user
 */
router.post("/report/:type/:id", authMiddleware, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;
    const currentUid = req.user.uid;

    if (!["User", "Post", "Recipe", "Comment"].includes(type)) {
      return res.status(400).json({ error: "Invalid report type" });
    }

    const reporter = await User.findOne({ firebaseUID: currentUid });
    if (!reporter) return res.status(404).json({ error: "User not found" });

    const newReport = new Report({
      reporter: reporter._id,
      reason,
      targetType: type,
      targetId: id,
    });

    await newReport.save();
    res.status(201).json({ message: "Report submitted successfully", report: newReport });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
