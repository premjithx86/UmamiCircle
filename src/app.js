const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Global Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter Rate Limiting for Auth/Sensitive routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Limit each IP to 20 attempts per 15 minutes
  message: { error: "Too many login/signup attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(helmet());
app.use(express.json());

// Enable ETags for all responses
app.set('etag', 'strong');

/**
 * Caching Middleware
 */
app.use((req, res, next) => {
  // Static image assets (if served directly) or image upload responses
  if (req.path.includes('/upload') || req.path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
  } 
  // Dynamic frequently changing data
  else if (
    req.path.includes('/notifications') || 
    req.path.includes('/feed') || 
    req.path.includes('/following') ||
    req.path.includes('/messages')
  ) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  // Semi-static data (profiles, posts) - rely on ETag
  else {
    res.set('Cache-Control', 'public, max-age=0');
  }
  next();
});

// Apply general limiter to all routes
app.use("/api/", generalLimiter);

// Apply strict limiter to auth routes
app.use("/api/users/login", authLimiter);
app.use("/api/users/signup", authLimiter);
app.use("/api/admin/login", authLimiter);

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const socialRoutes = require("./routes/socialRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messagingRoutes = require("./routes/messagingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messagingRoutes.messagingRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ai", aiRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
