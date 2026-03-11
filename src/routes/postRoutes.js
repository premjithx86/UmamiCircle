const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");
const { authMiddleware } = require("../middleware/auth");

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
