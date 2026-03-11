const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/auth");

/**
 * Create a comment
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, targetType, targetId } = req.body;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const newComment = new Comment({
      user: userDoc._id,
      content,
      targetType,
      targetId,
    });

    await newComment.save();

    // Increment commentsCount in the target model
    if (targetType === "Post") {
      await Post.findByIdAndUpdate(targetId, { $inc: { commentsCount: 1 } });
    } else if (targetType === "Recipe") {
      await Recipe.findByIdAndUpdate(targetId, { $inc: { commentsCount: 1 } });
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

/**
 * Get comments for a post or recipe
 */
router.get("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const comments = await Comment.find({ targetType: type, targetId: id })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete a comment
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Only comment owner can delete
    if (comment.user.toString() !== userDoc._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this comment" });
    }

    await Comment.findByIdAndDelete(commentId);

    // Decrement commentsCount in the target model
    if (comment.targetType === "Post") {
      await Post.findByIdAndUpdate(comment.targetId, { $inc: { commentsCount: -1 } });
    } else if (comment.targetType === "Recipe") {
      await Recipe.findByIdAndUpdate(comment.targetId, { $inc: { commentsCount: -1 } });
    }

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
