const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Post = require("../models/Post");
const Recipe = require("../models/Recipe");
const { adminAuth, authorizeRoles } = require("../middleware/adminAuth");
const router = express.Router();

/**
 * @route GET /api/admin/dashboard/stats
 * @desc Get platform-wide metrics for the dashboard
 * @access Private (Admin)
 */
router.get(["/dashboard/stats", "/stats"], adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalRecipes] = await Promise.all([
      User.countDocuments().catch(() => 0),
      Post.countDocuments().catch(() => 0),
      Recipe.countDocuments().catch(() => 0),
    ]);
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [dailyPosts, activeUsers] = await Promise.all([
      Post.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }).catch(() => 0),
      User.countDocuments({ updatedAt: { $gte: twentyFourHoursAgo } }).catch(() => 0),
    ]);

    res.status(200).json({
      totalUsers: totalUsers || 0,
      totalPosts: totalPosts || 0,
      totalRecipes: totalRecipes || 0,
      dailyPosts: dailyPosts || 0,
      activeUsers: activeUsers || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/admin/dashboard/activity
 * @desc Get recent platform activity logs
 * @access Private (Admin)
 */
router.get("/dashboard/activity", adminAuth, async (req, res) => {
  try {
    // Return empty array for now as activity logging is in the next track
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/admin/users
 * @desc List and search users
 * @access Private (Admin)
 */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/admin/users/:id/block
 * @desc Block or unblock a user account
 * @access Private (Admin)
 */
router.patch("/users/:id/block", adminAuth, async (req, res) => {
  try {
    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ error: "isBlocked must be a boolean" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { returnDocument: "after" }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/admin/users/:id
 * @desc Permanently delete a user account
 * @access Private (Admin/SuperAdmin)
 */
router.delete("/users/:id", adminAuth, authorizeRoles("Admin", "SuperAdmin"), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/admin/content/posts
 * @desc List and filter posts
 * @access Private (Admin)
 */
router.get("/content/posts", adminAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    if (search) {
      query.caption = { $regex: search, $options: "i" };
    }
    
    if (status) {
      query.moderationStatus = status;
    }

    const posts = await Post.find(query).populate("user", "username email").sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/admin/content/posts/:id
 * @desc Delete a post
 * @access Private (Admin)
 */
router.delete("/content/posts/:id", adminAuth, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/admin/content/recipes
 * @desc List and filter recipes
 * @access Private (Admin)
 */
router.get("/content/recipes", adminAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    
    if (status) {
      query.moderationStatus = status;
    }

    const recipes = await Recipe.find(query).populate("user", "username email").sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/admin/content/recipes/:id
 * @desc Delete a recipe
 * @access Private (Admin)
 */
router.delete("/content/recipes/:id", adminAuth, async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/admin/login
 * @desc Authenticate admin and return JWT
 * @access Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const secret = process.env.JWT_ADMIN_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_ADMIN_SECRET is not defined");
      return res.status(500).json({ error: "Internal server error" });
    }

    const token = jwt.sign(
      { _id: admin._id.toString(), role: admin.role },
      secret,
      { expiresIn: "24h" }
    );

    res.status(200).json({ admin, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/admin/me
 * @desc Get current authenticated admin info
 * @access Private (Admin)
 */
router.get("/me", adminAuth, async (req, res) => {
  res.status(200).json(req.admin);
});

/**
 * @route GET /api/admin/super-only
 * @desc Test route restricted to SuperAdmin
 * @access Private (SuperAdmin)
 */
router.get("/super-only", adminAuth, authorizeRoles("SuperAdmin"), (req, res) => {
  res.status(200).json({ message: "Welcome SuperAdmin" });
});

module.exports = router;
