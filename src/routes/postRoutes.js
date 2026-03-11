const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");

// Create a new post
router.post("/", upload.single("image"), moderateText, processImageModeration, async (req, res) => {
  try {
    const { user, tags } = req.body;
    
    // Create new post with moderated content
    const newPost = new Post({
      user,
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
