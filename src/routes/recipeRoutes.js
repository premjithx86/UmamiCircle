const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
const { moderateText } = require("../middleware/textModerationMiddleware");
const { authMiddleware } = require("../middleware/auth");
const { createNotification } = require("../services/notificationService");
const { generateRecipeSuggestion } = require("../services/aiService");
const { moderateAIContent, deleteFromCloudinary } = require("../services/moderationService");

/**
 * AI suggest recipe endpoint
 */
router.post("/ai-suggest", authMiddleware, async (req, res) => {
  try {
    const { dishName } = req.body;
    if (!dishName) {
      return res.status(400).json({ error: "Dish name is required" });
    }

    // Moderate the user-provided dish name input
    if (!moderateAIContent(dishName)) {
      return res.status(400).json({ error: "Dish name contains inappropriate language" });
    }

    let suggestion;
    try {
      suggestion = await generateRecipeSuggestion(dishName);
    } catch (aiError) {
      console.error("aiService.generateRecipeSuggestion failed:", aiError);
      return res.status(500).json({ 
        error: "AI suggestion unavailable, please fill manually",
        details: aiError.message 
      });
    }

    // Return AI suggestion directly without moderating output
    // Groq content is trusted and obscenity filters often flag cooking terms (e.g. "breast", "thighs")
    res.status(200).json(suggestion);
  } catch (error) {
    console.error("Unexpected AI Suggest Route Error:", error);
    res.status(500).json({ error: "An unexpected error occurred during AI suggestion" });
  }
});

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
    const recipe = await Recipe.findOne({ _id: req.params.id, isHidden: { $ne: true } })
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
 * Update a recipe (description and tags only for now)
 */
router.put("/:id", authMiddleware, moderateText, async (req, res) => {
  try {
    const { description, tags } = req.body;
    const recipeId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    if (recipe.user.toString() !== userDoc._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to edit this recipe" });
    }

    recipe.description = req.censoredText || description || recipe.description;
    if (tags) {
      recipe.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }

    await recipe.save();
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

/**
 * Delete a recipe
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const currentUid = req.user.uid;

    const userDoc = await User.findOne({ firebaseUID: currentUid });
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    if (recipe.user.toString() !== userDoc._id.toString()) {
      return res.status(403).json({ error: "Unauthorized to delete this recipe" });
    }

    if (recipe.imageUrl) {
      await deleteFromCloudinary(recipe.imageUrl);
    }

    await Recipe.findByIdAndDelete(recipeId);
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
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

/**
 * Toggle bookmark on a recipe
 */
router.post("/:id/bookmark", authMiddleware, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const currentUid = req.user.uid;

    const user = await User.findOne({ firebaseUID: currentUid });
    if (!user) return res.status(404).json({ error: "User not found" });

    const bookmarkIndex = user.bookmarks.findIndex(
      (b) => b.targetType === "Recipe" && b.targetId.toString() === recipeId
    );

    if (bookmarkIndex === -1) {
      user.bookmarks.push({ targetType: "Recipe", targetId: recipeId });
      await Recipe.findByIdAndUpdate(recipeId, { $addToSet: { bookmarks: user._id } });
      await user.save();
      return res.status(200).json({ message: "Recipe bookmarked successfully", isBookmarked: true });
    } else {
      user.bookmarks.splice(bookmarkIndex, 1);
      await Recipe.findByIdAndUpdate(recipeId, { $pull: { bookmarks: user._id } });
      await user.save();
      return res.status(200).json({ message: "Bookmark removed successfully", isBookmarked: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get recipes by user ID
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.params.userId, isHidden: { $ne: true } })
      .populate("user", "username name profilePicUrl")
      .sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
