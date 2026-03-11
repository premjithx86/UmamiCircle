const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const socialRoutes = require("./routes/socialRoutes");

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/social", socialRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
