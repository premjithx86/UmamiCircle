const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");
const { authMiddleware } = require("../middleware/auth");
const { createNotification } = require("../services/notificationService");

// Create a new post
router.post("/", authMiddleware, upload.single("image"), moderateText, processImageModeration, async (req, res) => {
  try {
    // If it's a duplicate, return the existing image URL and info
    if (req.isDuplicate) {
      return res.status(200).json({
        message: "Duplicate image detected. Reusing existing resource.",
        imageUrl: req.imageUrl,
        imageHash: req.imageHash,
      });
    }

    const { tags } = req.body;
    
    // Fetch the correct User ObjectId from MongoDB using req.user (from authMiddleware)
    const userDoc = await User.findOne({ firebaseUID: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found in database" });
    }

    // Create new post with moderated content
    const newPost = new Post({
      user: userDoc._id,
      caption: req.censoredText || req.body.caption,
      imageUrl: req.imageUrl,
      imageHash: req.imageHash,
      tags: tags ? JSON.parse(tags) : [],
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

/**
 * Get the home feed (posts from users the current user follows)
 */
router.get("/following", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userDoc = await User.findOne({ firebaseUID: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    // Include user's own posts plus posts from people they follow
    const userIds = [...userDoc.following, userDoc._id];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user", "username profilePicUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching home feed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get exploration feed (all posts, trending first)
 */
router.get("/explore", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Simple trending logic: Sort by number of likes then by date
    const posts = await Post.find()
      .populate("user", "username profilePicUrl")
      .sort({ likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching explore feed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Search posts and recipes
 */
router.get("/search", async (req, res) => {
  try {
    const { q, type, tags } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { caption: { $regex: q, $options: "i" } },
        { title: { $regex: q, $options: "i" } },
      ];
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Optional filtering by type if we separate models in the future
    // for now Post and Recipe are separate, so we might need a more complex search
    // or just search Posts (which currently includes recipes in some logic?)
    // Let's check Recipe model
    
    const posts = await Post.find(query)
      .populate("user", "username profilePicUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Toggle like/unlike on a post
 */
router.post("/like/:id", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userDoc._id);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userDoc._id);
      await post.save();

      // Trigger Notification
      await createNotification({
        user: post.user,
        actor: userDoc._id,
        type: "like",
        targetType: "Post",
        targetId: post._id,
      });

      return res.status(200).json({ message: "Post liked successfully", likes: post.likes.length });
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).json({ message: "Post unliked successfully", likes: post.likes.length });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

module.exports = router;
