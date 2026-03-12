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
 * Middleware for text moderation.
 */
const moderateText = async (req, res, next) => {
  const textToModerate = req.body.caption || req.body.description || req.body.title;

  if (!textToModerate) {
    return next();
  }

  try {
    // 1. Profanity check (obscenity)
    const hasProfanity = matcher.hasMatch(textToModerate);
    if (hasProfanity) {
      return res.status(400).json({ error: "Content contains inappropriate language" });
    }

    // Since we reject profanity now, req.censoredText is just the original text
    req.censoredText = textToModerate;

    // 2. Food Relevance check (Groq)
    const relevance = await validateFoodRelevance(textToModerate);
    if (!relevance.relevant) {
      return res.status(400).json({ error: "Content must be food-related" });
    }

    next();
  } catch (error) {
    console.error("Text moderation error:", error);
    res.status(500).json({ error: "Failed to process text moderation" });
  }
};

module.exports = { moderateText };
