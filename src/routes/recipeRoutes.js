const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");
const { authMiddleware } = require("../middleware/auth");
const { createNotification } = require("../services/notificationService");

/**
 * Helper to handle recipe creation logic
 */
const createRecipeLogic = async (req, res) => {
  try {
    // If it's a duplicate, return the existing image URL and info
    if (req.isDuplicate) {
      return res.status(200).json({
        message: "Duplicate image detected. Reusing existing resource.",
        imageUrl: req.imageUrl,
        imageHash: req.imageHash,
      });
    }

    let { title, description, ingredients, steps, tags, prepTime, cookTime, servings, difficulty, imageUrl, imageHash } = req.body;
    
    imageUrl = req.imageUrl || imageUrl;
    imageHash = req.imageHash || imageHash;
    description = req.censoredText || description;

    if (!imageUrl || !imageHash) {
      return res.status(400).json({ error: "Image URL and Hash are required" });
    }

    // Fetch the correct User ObjectId from MongoDB using req.user (from authMiddleware)
    const userDoc = await User.findOne({ firebaseUID: req.user.uid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found in database" });
    }

    const newRecipe = new Recipe({
      user: userDoc._id,
      title,
      description: description,
      ingredients: ingredients ? (typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients) : [],
      steps: steps ? (typeof steps === 'string' ? JSON.parse(steps) : steps) : [],
      imageUrl: imageUrl,
      imageHash: imageHash,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
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
};

// Unified route for creation
router.post("/", authMiddleware, (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return upload.single("image")(req, res, () => {
      moderateText(req, res, () => {
        processImageModeration(req, res, () => {
          createRecipeLogic(req, res);
        });
      });
    });
  }
  moderateText(req, res, () => {
    createRecipeLogic(req, res);
  });
});

/**
 * Get a single recipe by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("user", "username profilePicUrl name");
    
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error.message);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

/**
 * Toggle like/unlike on a recipe
 */
router.post("/like/:id", authMiddleware, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const likeIndex = recipe.likes.indexOf(userDoc._id);

    if (likeIndex === -1) {
      recipe.likes.push(userDoc._id);
      await recipe.save();

      await createNotification({
        user: recipe.user,
        actor: userDoc._id,
        type: "like",
        targetType: "Recipe",
        targetId: recipe._id,
      });

      return res.status(200).json({ message: "Recipe liked successfully", likes: recipe.likes.length });
    } else {
      recipe.likes.splice(likeIndex, 1);
      await recipe.save();
      return res.status(200).json({ message: "Recipe unliked successfully", likes: recipe.likes.length });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

module.exports = router;
