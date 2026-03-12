const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");
const { authMiddleware } = require("../middleware/auth");
const { createNotification } = require("../services/notificationService");

/**
 * Helper to handle post creation logic
 */
const createPostLogic = async (req, res) => {
  try {
    // If it's a duplicate from image moderation, return existing info
    if (req.isDuplicate) {
      return res.status(200).json({
        message: "Duplicate image detected. Reusing existing resource.",
        imageUrl: req.imageUrl,
        imageHash: req.imageHash,
      });
    }

    let { tags, imageUrl, imageHash, caption } = req.body;
    
    // Use moderated values if available
    imageUrl = req.imageUrl || imageUrl;
    imageHash = req.imageHash || imageHash;
    caption = req.censoredText || caption;

    if (!imageUrl || !imageHash) {
      return res.status(400).json({ error: "Image URL and Hash are required" });
    }

    const userDoc = await User.findOne({ firebaseUID: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const newPost = new Post({
      user: userDoc._id,
      caption: caption,
      imageUrl: imageUrl,
      imageHash: imageHash,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// Unified route for creation (handles both direct file upload and JSON with pre-uploaded URL)
router.post("/", authMiddleware, (req, res, next) => {
  // Check if it's a multipart request (file upload)
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return upload.single("image")(req, res, () => {
      moderateText(req, res, () => {
        processImageModeration(req, res, () => {
          createPostLogic(req, res);
        });
      });
    });
  }
  // Otherwise assume JSON with pre-uploaded imageUrl
  moderateText(req, res, () => {
    createPostLogic(req, res);
  });
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
 * Get exploration feed
 */
router.get("/explore", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

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
    const { q, tags } = req.query;
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
 * Get a single post by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "username profilePicUrl name");
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error.message);
    res.status(500).json({ error: "Failed to fetch post" });
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
      post.likes.push(userDoc._id);
      await post.save();

      await createNotification({
        user: post.user,
        actor: userDoc._id,
        type: "like",
        targetType: "Post",
        targetId: post._id,
      });

      return res.status(200).json({ message: "Post liked successfully", likes: post.likes.length });
    } else {
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
