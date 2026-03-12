const { 
  RegExpMatcher, 
  englishDataset, 
  englishRecommendedTransformers 
} = require('obscenity');
const { validateFoodRelevance } = require("../services/moderationService");

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

/**
 * Middleware for text moderation, including main content and tags.
 */
const moderateText = async (req, res, next) => {
  const { caption, description, title, tags } = req.body;
  const mainText = caption || description || title;

  try {
    // 1. Moderate main content if it exists
    if (mainText) {
      const hasProfanity = matcher.hasMatch(mainText);
      if (hasProfanity) {
        return res.status(400).json({ error: "Content contains inappropriate language" });
      }

      const relevance = await validateFoodRelevance(mainText);
      if (!relevance.relevant) {
        return res.status(400).json({ error: "Content must be food-related" });
      }
      
      req.censoredText = mainText;
    }

    // 2. Moderate tags if they exist
    if (tags) {
      let tagArray = [];
      try {
        tagArray = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        // If parsing fails, treat as a single string (unlikely given frontend code)
        tagArray = [tags];
      }

      if (Array.isArray(tagArray)) {
        for (const tag of tagArray) {
          // Check each tag for profanity
          if (matcher.hasMatch(tag)) {
            return res.status(400).json({ error: `Tag "${tag}" contains inappropriate language` });
          }

          // Check each tag for food relevance
          const tagRelevance = await validateFoodRelevance(tag);
          if (!tagRelevance.relevant) {
            return res.status(400).json({ error: `Tag "${tag}" must be food-related` });
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error("Text moderation error:", error);
    res.status(500).json({ error: "Failed to process text moderation" });
  }
};

module.exports = { moderateText };
