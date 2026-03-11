const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");

// Create a new recipe
router.post("/", upload.single("image"), moderateText, processImageModeration, async (req, res) => {
  try {
    const { user, title, description, ingredients, steps, tags, prepTime, cookTime, servings, difficulty } = req.body;
    
    const newRecipe = new Recipe({
      user,
      title,
      description: req.censoredText || description,
      ingredients: ingredients ? JSON.parse(ingredients) : [],
      steps: steps ? JSON.parse(steps) : [],
      imageUrl: req.imageUrl,
      imageHash: req.imageHash,
      tags: tags ? JSON.parse(tags) : [],
      prepTime,
      cookTime,
      servings,
      difficulty,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (error) {
    console.error("Error creating recipe:", error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

module.exports = router;
