const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Post = require("../models/Post");
const Recipe = require("../models/Recipe");
const Report = require("../models/Report");
const AuditLog = require("../models/AuditLog");
const BlockedSession = require("../models/BlockedSession");
const { adminAuth, authorizeRoles } = require("../middleware/adminAuth");
const { logAction } = require("../services/auditService");
const { deleteFromCloudinary } = require("../services/moderationService");
const router = express.Router();

const { createNotification } = require("../services/notificationService");

/**
 * @route PATCH /api/admin/content/:type/:id/status
 * @desc Approve, Reject or Flag content
 * @access Private (Admin)
 */
router.patch("/content/:type/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const { type, id } = req.params;
    
    if (!["approved", "rejected", "flagged"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const Model = type.toLowerCase() === "post" ? Post : Recipe;
    const item = await Model.findByIdAndUpdate(
      id,
      { moderationStatus: status },
      { returnDocument: "after" }
    );

    if (!item) return res.status(404).json({ error: "Content not found" });

    await logAction({
      adminId: req.admin._id,
      action: "UPDATE_MODERATION_STATUS",
      targetType: type.charAt(0).toUpperCase() + type.slice(1),
      targetId: item._id,
      details: { status },
      ipAddress: req.ip,
    });

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/admin/content/:type/:id/hide
 * @desc Hide or unhide content
 * @access Private (Admin)
 */
router.patch("/content/:type/:id/hide", adminAuth, async (req, res) => {
  try {
    const { isHidden } = req.body;
    const { type, id } = req.params;

    const Model = type.toLowerCase() === "post" ? Post : Recipe;
    const item = await Model.findByIdAndUpdate(
      id,
      { isHidden },
      { returnDocument: "after" }
    ).populate("user");

    if (!item) return res.status(404).json({ error: "Content not found" });

    await logAction({
      adminId: req.admin._id,
      action: isHidden ? "HIDE_CONTENT" : "UNHIDE_CONTENT",
      targetType: type.charAt(0).toUpperCase() + type.slice(1),
      targetId: item._id,
      details: { isHidden },
      ipAddress: req.ip,
    });

    // Notify author if hidden
    if (isHidden && item.user) {
      const contentDesc = item.caption || item.title;
      await createNotification({
        user: item.user._id,
        actor: null, // System notification
        type: "system",
        targetType: type.charAt(0).toUpperCase() + type.slice(1),
        targetId: item._id,
        content: `Your ${type.toLowerCase()} "${contentDesc.substring(0, 20)}..." has been hidden by our moderation team for violating community guidelines.`
      });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PUT /api/admin/content/:type/:id
 * @desc Update content details (Admin) - Fix: Do not overwrite author
 * @access Private (Admin)
 */
router.put("/content/:type/:id", adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { caption, description, tags, moderationStatus } = req.body;

    const Model = type.toLowerCase() === "post" ? Post : Recipe;
    
    // Explicitly pick only allowed fields to prevent overwriting 'user'
    const updateData = {};
    if (caption !== undefined) updateData.caption = caption;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (moderationStatus !== undefined) updateData.moderationStatus = moderationStatus;

    const item = await Model.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: "after", runValidators: true }
    );

    if (!item) return res.status(404).json({ error: "Content not found" });

    await logAction({
      adminId: req.admin._id,
      action: "EDIT_CONTENT_ADMIN",
      targetType: type.charAt(0).toUpperCase() + type.slice(1),
      targetId: item._id,
      details: { updates: updateData },
      ipAddress: req.ip,
    });

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route DELETE /api/admin/content/:type/:id
 * @desc Delete content and notify author
 * @access Private (Admin)
 */
router.delete("/content/:type/:id", adminAuth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = type.toLowerCase() === "post" ? Post : Recipe;
    
    const item = await Model.findById(id);
    if (!item) return res.status(404).json({ error: "Content not found" });

    const contentDesc = item.caption || item.title;
    const userId = item.user;

    if (item.imageUrl) {
      await deleteFromCloudinary(item.imageUrl);
    }

    await Model.findByIdAndDelete(id);

    await logAction({
      adminId: req.admin._id,
      action: `DELETE_${type.toUpperCase()}`,
      targetType: type.charAt(0).toUpperCase() + type.slice(1),
      targetId: id,
      details: { contentDesc },
      ipAddress: req.ip,
    });

    // Notify author
    if (userId) {
      await createNotification({
        user: userId,
        actor: null,
        type: "system",
        targetType: "User", // Can't link to deleted content
        targetId: userId,
        content: `Your ${type.toLowerCase()} "${contentDesc.substring(0, 20)}..." has been removed by our moderation team for violating community guidelines.`
      });
    }

    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

    // Immediately invalidate session
    if (isBlocked) {
      await BlockedSession.findOneAndUpdate(
        { firebaseUID: user.firebaseUID },
        { firebaseUID: user.firebaseUID },
        { upsert: true }
      );
    } else {
      await BlockedSession.deleteOne({ firebaseUID: user.firebaseUID });
    }

    await logAction({
      adminId: req.admin._id,
      action: isBlocked ? "BLOCK_USER" : "UNBLOCK_USER",
      targetType: "User",
      targetId: user._id,
      details: { username: user.username },
      ipAddress: req.ip,
    });

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

    await logAction({
      adminId: req.admin._id,
      action: "DELETE_USER",
      targetType: "User",
      targetId: user._id,
      details: { username: user.username, email: user.email },
      ipAddress: req.ip,
    });

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

    const posts = await Post.find(query).populate("user", "username email profilePicUrl name").sort({ createdAt: -1 });
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
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.imageUrl) {
      await deleteFromCloudinary(post.imageUrl);
    }

    await Post.findByIdAndDelete(req.params.id);

    await logAction({
      adminId: req.admin._id,
      action: "DELETE_POST",
      targetType: "Post",
      targetId: post._id,
      details: { caption: post.caption },
      ipAddress: req.ip,
    });

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
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    if (recipe.imageUrl) {
      await deleteFromCloudinary(recipe.imageUrl);
    }

    await Recipe.findByIdAndDelete(req.params.id);

    await logAction({
      adminId: req.admin._id,
      action: "DELETE_RECIPE",
      targetType: "Recipe",
      targetId: recipe._id,
      details: { title: recipe.title },
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/admin/reports
 * @desc List and filter reports
 * @access Private (Admin)
 */
router.get("/reports", adminAuth, async (req, res) => {
  try {
    const { status, targetType } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (targetType) {
      query.targetType = targetType;
    }

    const reports = await Report.find(query)
      .populate("reporter", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route PATCH /api/admin/reports/:id
 * @desc Update report status or add admin comment
 * @access Private (Admin)
 */
router.patch("/reports/:id", adminAuth, async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminComment },
      { returnDocument: "after" }
    );
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    await logAction({
      adminId: req.admin._id,
      action: "RESOLVE_REPORT",
      targetType: "Report",
      targetId: report._id,
      details: { status, adminComment, targetType: report.targetType, targetId: report.targetId },
      ipAddress: req.ip,
    });

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/admin/reports/:id/action
 * @desc Take action on a report (Delete, Hide, Warn)
 * @access Private (Admin)
 */
router.post("/reports/:id/action", adminAuth, async (req, res) => {
  try {
    const { action, warnMessage } = req.body; // 'delete', 'hide', 'warn'
    const reportId = req.params.id;

    const report = await Report.findById(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const { targetType, targetId } = report;
    const Model = targetType === "Post" ? Post : Recipe;

    if (action === "delete") {
      const item = await Model.findById(targetId);
      if (item) {
        const contentDesc = item.caption || item.title;
        const userId = item.user;
        
        await Model.findByIdAndDelete(targetId);
        
        // Notify author
        if (userId) {
          await createNotification({
            user: userId,
            actor: null,
            type: "system",
            targetType: "User",
            targetId: userId,
            content: `Your ${targetType.toLowerCase()} "${contentDesc.substring(0, 20)}..." has been removed by our moderation team for violating community guidelines.`
          });
        }
      }
    } else if (action === "hide") {
      const item = await Model.findByIdAndUpdate(targetId, { isHidden: true }, { returnDocument: "after" });
      if (item) {
        const contentDesc = item.caption || item.title;
        // Notify author
        await createNotification({
          user: item.user,
          actor: null,
          type: "system",
          targetType: targetType,
          targetId: item._id,
          content: `Your ${targetType.toLowerCase()} "${contentDesc.substring(0, 20)}..." has been hidden by our moderation team for violating community guidelines.`
        });
      }
    } else if (action === "warn") {
      // Find author of the target content
      const item = await Model.findById(targetId);
      if (item && item.user) {
        await createNotification({
          user: item.user,
          actor: null,
          type: "system",
          targetType: targetType,
          targetId: targetId,
          content: warnMessage ? `You have received a warning: ${warnMessage}` : `A formal warning has been issued regarding your ${targetType.toLowerCase()}. Please review community guidelines.`
        });
      }
    }

    // Mark report as action taken
    report.status = "action_taken";
    await report.save();

    await logAction({
      adminId: req.admin._id,
      action: `REPORT_ACTION_${action.toUpperCase()}`,
      targetType: "Report",
      targetId: reportId,
      details: { action, targetType, targetId },
      ipAddress: req.ip,
    });

    res.status(200).json({ message: `Action '${action}' applied successfully`, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/admin/logs
 * @desc List and filter audit logs
 * @access Private (Admin)
 */
router.get("/logs", adminAuth, async (req, res) => {
  try {
    const { action, targetType, adminId } = req.query;
    let query = {};
    
    if (action) {
      query.action = action;
    }
    
    if (targetType) {
      query.targetType = targetType;
    }

    if (adminId) {
      query.admin = adminId;
    }

    const logs = await AuditLog.find(query)
      .populate("admin", "username role")
      .sort({ createdAt: -1 });
    res.status(200).json(logs);
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
