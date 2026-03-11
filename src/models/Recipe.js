const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  ingredients: [{
    type: String,
    required: true,
  }],
  steps: [{
    type: String,
    required: true,
  }],
  imageUrl: {
    type: String,
    required: true,
  },
  imageHash: {
    type: String,
    required: true,
    unique: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  commentsCount: {
    type: Number,
    default: 0,
  },
  prepTime: {
    type: String, // e.g., "30 mins"
  },
  cookTime: {
    type: String,
  },
  servings: {
    type: Number,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Recipe", RecipeSchema);
