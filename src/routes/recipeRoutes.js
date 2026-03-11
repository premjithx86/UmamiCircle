const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");
const { authMiddleware } = require("../middleware/auth");

// Create a new recipe
router.post("/", authMiddleware, upload.single("image"), moderateText, processImageModeration, async (req, res) => {
  try {
    // If it's a duplicate, return the existing image URL and info
    if (req.isDuplicate) {
      return res.status(200).json({
        message: "Duplicate image detected. Reusing existing resource.",
        imageUrl: req.imageUrl,
        imageHash: req.imageHash,
      });
    }

    const { title, description, ingredients, steps, tags, prepTime, cookTime, servings, difficulty } = req.body;
    
    // Fetch the correct User ObjectId from MongoDB using req.user (from authMiddleware)
    const userDoc = await User.findOne({ firebaseUID: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const newRecipe = new Recipe({
      user: userDoc._id,
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
