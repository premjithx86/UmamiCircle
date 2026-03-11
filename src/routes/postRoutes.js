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

module.exports = router;
