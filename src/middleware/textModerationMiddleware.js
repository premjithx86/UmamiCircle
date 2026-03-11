const {
	RegExpMatcher,
	englishDataset,
	asteriskCensorStrategy,
	TextCensor,
} = require("obscenity");
const { validateFoodRelevance } = require("../services/moderationService");

const matcher = new RegExpMatcher({
	...englishDataset.build(),
});
const censor = new TextCensor();
const strategy = asteriskCensorStrategy(Buffer.from("*")[0]);

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
		const matches = matcher.getAllMatches(textToModerate);
		if (matches.length > 0) {
			const censored = censor.applyStrategy(textToModerate, strategy, matches);
			req.censoredText = censored;
      // Option: Return 400 or just censor.
      // For this project, we'll reject if too profane or censor.
      // Let's censor it and move to food relevance.
		} else {
      req.censoredText = textToModerate;
    }

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
