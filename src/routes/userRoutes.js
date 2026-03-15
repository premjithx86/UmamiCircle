const express = require("express");
const User = require("../models/User");
const Post = require("../models/Post");
const Recipe = require("../models/Recipe");
const { authMiddleware, optionalAuthMiddleware, stripRole } = require("../middleware/auth");
const { deleteFromCloudinary } = require("../services/moderationService");
const router = express.Router();

// Get current user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update current user profile
router.put("/me", authMiddleware, stripRole, async (req, res) => {
  try {
    const updates = req.body;
    
    // If updating profile picture, delete old one from Cloudinary
    if (updates.profilePicUrl) {
      const oldUser = await User.findOne({ firebaseUID: req.user.uid });
      if (oldUser && oldUser.profilePicUrl && oldUser.profilePicUrl !== updates.profilePicUrl) {
        await deleteFromCloudinary(oldUser.profilePicUrl);
      }
    }

    const user = await User.findOneAndUpdate(
      { firebaseUID: req.user.uid },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user bookmarks
router.get("/bookmarks", authMiddleware, async (req, res) => {
  try {
    console.log("Hitting GET /api/users/bookmarks");
    const user = await User.findOne({ firebaseUID: req.user.uid })
      .populate({
        path: "bookmarks.targetId",
        populate: {
          path: "user",
          select: "username name profilePicUrl"
        }
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = [];
    const recipes = [];

    user.bookmarks.forEach(b => {
      if (b.targetId) {
        const item = b.targetId.toObject();
        item.type = b.targetType;
        
        if (b.targetType === "Post") {
          posts.push(item);
        } else if (b.targetType === "Recipe") {
          recipes.push(item);
        }
      }
    });
    
    res.status(200).json({ posts, recipes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } }
      ]
    }).select("username name profilePicUrl bio")
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync user from Firebase with MongoDB using upsert
router.post("/sync", authMiddleware, async (req, res) => {
  try {
    const { username, name, email, dob } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const firebaseUID = req.user.uid;
    
    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { 
        $set: { email, dob },
        $setOnInsert: { 
          firebaseUID,
          username: username || email.split('@')[0], 
          name: name || email.split('@')[0]
        } 
      },
      { 
        upsert: true, 
        returnDocument: 'after', 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.status(200).json({ message: "User synced", user });
  } catch (error) {
    console.error("Sync error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET top chefs sorted by follower count
 */
router.get("/top-chefs", async (req, res) => {
  try {
    const users = await User.find({})
      .select("username name profilePicUrl followers")
      .lean();

    const sortedUsers = users
      .map(u => ({
        ...u,
        followersCount: (u.followers || []).length
      }))
      .sort((a, b) => b.followersCount - a.followersCount)
      .slice(0, 6);

    res.status(200).json(sortedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get user profile by username - THIS MUST BE LAST
 */
router.get("/:username", optionalAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-firebaseUID -bookmarks -notifications -role");
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user) {
      const currentUser = await User.findOne({ firebaseUID: req.user.uid });
      if (currentUser && user.blocked.includes(currentUser._id)) {
        return res.status(403).json({ error: "This profile is not available" });
      }
    }

    const postsCount = await Post.countDocuments({ user: user._id, isHidden: { $ne: true } });
    const recipesCount = await Recipe.countDocuments({ user: user._id, isHidden: { $ne: true } });
    
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    let isFollowing = false;
    let isBlockedByMe = false;
    
    if (req.user) {
      const currentUser = await User.findOne({ firebaseUID: req.user.uid });
      if (currentUser) {
        isFollowing = user.followers.includes(currentUser._id);
        isBlockedByMe = currentUser.blocked.includes(user._id);
      }
    }

    const userObj = user.toObject();
    delete userObj.blocked;

    res.status(200).json({
      ...userObj,
      postsCount,
      recipesCount,
      followersCount,
      followingCount,
      isFollowing,
      isBlockedByMe
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
