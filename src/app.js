const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Global Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messagingRoutes.messagingRouter);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
