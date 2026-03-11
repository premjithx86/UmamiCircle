const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Post = require("../models/Post");
const Recipe = require("../models/Recipe");
const { adminAuth, authorizeRoles } = require("../middleware/adminAuth");
const router = express.Router();

// Get dashboard stats
router.get("/dashboard/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments() || 0;
    const totalPosts = await Post.countDocuments() || 0;
    const totalRecipes = await Recipe.countDocuments() || 0;
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyPosts = await Post.countDocuments({
      createdAt: { $gte: twentyFourHoursAgo },
    }) || 0;

    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: twentyFourHoursAgo },
    }) || 0;

    res.status(200).json({
      totalUsers,
      totalPosts,
      totalRecipes,
      dailyPosts,
      activeUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent platform activity
router.get("/dashboard/activity", adminAuth, async (req, res) => {
  try {
    // Return empty array for now as activity logging is in the next track
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List and search users
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

// Block/Unblock user
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

// Delete user
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

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const token = jwt.sign(
      { _id: admin._id.toString(), role: admin.role },
      process.env.JWT_ADMIN_SECRET || "supersecretadminkey",
      { expiresIn: "24h" }
    );

    res.status(200).json({ admin, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current admin info
router.get("/me", adminAuth, async (req, res) => {
  res.status(200).json(req.admin);
});

// Test route for SuperAdmin only
router.get("/super-only", adminAuth, authorizeRoles("SuperAdmin"), (req, res) => {
  res.status(200).json({ message: "Welcome SuperAdmin" });
});

module.exports = router;
