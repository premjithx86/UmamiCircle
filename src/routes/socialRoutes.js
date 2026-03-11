const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

/**
 * Follow a user
 */
router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.uid;

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findOne({ firebaseUID: currentUserId });

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (currentUser._id.toString() === targetUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
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
    const currentUserId = req.user.uid;

    const userToUnfollow = await User.findById(targetUserId);
    const currentUser = await User.findOne({ firebaseUID: currentUserId });

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

module.exports = router;
