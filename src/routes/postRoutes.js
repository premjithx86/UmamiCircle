const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");
const { authMiddleware, optionalAuthMiddleware } = require("../middleware/auth");
const { createNotification } = require("../services/notificationService");
const { deleteFromCloudinary } = require("../services/moderationService");

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
 * Get the home feed (posts and recipes from users the current user follows)
 * If not logged in or feed is empty, returns popular content (discover)
 */
router.get("/following", optionalAuthMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Helper to get public/discover content
    const getPublicContent = async () => {
      const [posts, recipes] = await Promise.all([
        Post.find({ isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ likes: -1, createdAt: -1 }).limit(limit * 2),
        Recipe.find({ isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ likes: -1, createdAt: -1 }).limit(limit * 2)
      ]);

      return [...posts, ...recipes]
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(skip, skip + limit);
    };

    // If not logged in, return popular content
    if (!req.user) {
      const publicContent = await getPublicContent();
      return res.status(200).json(publicContent);
    }

    const userDoc = await User.findOne({ firebaseUID: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user follows no one, show public feed
    if (!userDoc.following || userDoc.following.length === 0) {
      const publicContent = await getPublicContent();
      return res.status(200).json(publicContent);
    }

    const userIds = [...userDoc.following, userDoc._id];

    const [posts, recipes] = await Promise.all([
      Post.find({ user: { $in: userIds }, isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ createdAt: -1 }).limit(limit * 2),
      Recipe.find({ user: { $in: userIds }, isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ createdAt: -1 }).limit(limit * 2)
    ]);

    let merged = [...posts, ...recipes]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    // If following feed is empty, show public feed
    if (merged.length === 0 && page === 1) {
      merged = await getPublicContent();
    }

    res.status(200).json(merged);
  } catch (error) {
    console.error("Error fetching home feed:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get discovery feed (alias for public content)
 */
router.get("/feed/discover", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [posts, recipes] = await Promise.all([
      Post.find({ isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ likes: -1, createdAt: -1 }).limit(limit * 2),
      Recipe.find({ isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ likes: -1, createdAt: -1 }).limit(limit * 2)
    ]);

    const merged = [...posts, ...recipes]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    res.status(200).json(merged);
  } catch (error) {
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

    const [posts, recipes] = await Promise.all([
      Post.find({ isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ likes: -1, createdAt: -1 }).limit(limit * 2).lean(),
      Recipe.find({ isHidden: { $ne: true } }).populate("user", "username name profilePicUrl").sort({ likes: -1, createdAt: -1 }).limit(limit * 2).lean()
    ]);

    const merged = [
      ...posts.map(p => ({ ...p, type: 'post', likesCount: (p.likes || []).length })),
      ...recipes.map(r => ({ ...r, type: 'recipe', likesCount: (r.likes || []).length }))
    ]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    res.status(200).json(merged);
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
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    query.isHidden = { $ne: true };
    
    const [posts, recipes] = await Promise.all([
      Post.find(query).populate("user", "username name profilePicUrl").sort({ createdAt: -1 }),
      Recipe.find(query).populate("user", "username name profilePicUrl").sort({ createdAt: -1 })
    ]);

    const merged = [...posts, ...recipes].sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(merged);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET trending tags from both posts and recipes
 */
router.get("/trending-tags", async (req, res) => {
  try {
    const postTags = await Post.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } }
    ]);

    const recipeTags = await Recipe.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } }
    ]);

    const tagMap = {};
    postTags.forEach(t => tagMap[t._id] = (tagMap[t._id] || 0) + t.count);
    recipeTags.forEach(t => tagMap[t._id] = (tagMap[t._id] || 0) + t.count);

    const sortedTags = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json(sortedTags);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET trending posts and recipes combined
 */
router.get("/trending", async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user", "username name profilePicUrl")
      .lean();
    
    const recipes = await Recipe.find({})
      .populate("user", "username name profilePicUrl")
      .lean();

    const allContent = [
      ...posts.map(p => ({ ...p, type: 'post', likesCount: (p.likes || []).length })),
      ...recipes.map(r => ({ ...r, type: 'recipe', likesCount: (r.likes || []).length }))
    ];

    const sortedContent = allContent
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, 5);

    res.status(200).json(sortedContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get a single post by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isHidden: { $ne: true } })
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
 * Update a post (caption and tags only)
 */
router.put("/:id", authMiddleware, moderateText, async (req, res) => {
  try {
    const { caption, tags } = req.body;
    const postId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.user.toString() !== userDoc._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to edit this post" });
    }

    post.caption = req.censoredText || caption || post.caption;
    if (tags) {
      post.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

/**
 * Delete a post
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    const post = await Post.findById(postId);

    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.user.toString() !== userDoc._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this post" });
    }

    if (post.imageUrl) {
      await deleteFromCloudinary(post.imageUrl);
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Failed to delete post" });
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

/**
 * Toggle bookmark on a post
 */
router.post("/:id/bookmark", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const currentUid = req.user.uid;

    const user = await User.findOne({ firebaseUID: currentUid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const bookmarkIndex = user.bookmarks.findIndex(
      (b) => b.targetType === "Post" && b.targetId.toString() === postId
    );

    if (bookmarkIndex === -1) {
      user.bookmarks.push({ targetType: "Post", targetId: postId });
      await Post.findByIdAndUpdate(postId, { $addToSet: { bookmarks: user._id } });
      await user.save();
      return res.status(200).json({ message: "Post bookmarked successfully", isBookmarked: true });
    } else {
      user.bookmarks.splice(bookmarkIndex, 1);
      await Post.findByIdAndUpdate(postId, { $pull: { bookmarks: user._id } });
      await user.save();
      return res.status(200).json({ message: "Bookmark removed successfully", isBookmarked: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get posts by user ID
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId, isHidden: { $ne: true } })
      .populate("user", "username name profilePicUrl")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
