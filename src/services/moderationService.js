const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const FormData = require("form-data");
const { Groq } = require("groq-sdk");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

/**
 * Generates an MD5 hash of a buffer.
 * Used for image deduplication.
 */
const generateHash = (buffer) => {
  return crypto.createHash("md5").update(buffer).digest("hex");
};

/**
 * Checks image safety using Sightengine API via Axios.
 */
const checkImageSafety = async (imageBuffer) => {
  if (process.env.NODE_ENV === "test") {
    return { safe: true };
  }

  if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
    console.warn("Sightengine not configured. Skipping safety check.");
    return { safe: true };
  }

  try {
    const form = new FormData();
    form.append('media', imageBuffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
    form.append('models', 'nudity,offensive,wad');
    form.append('api_user', process.env.SIGHTENGINE_API_USER);
    form.append('api_secret', process.env.SIGHTENGINE_API_SECRET);

    const response = await axios.post('https://api.sightengine.com/1.0/check.json', form, {
      headers: form.getHeaders()
    });

    const result = response.data;
    
    if (result.status === 'failure') {
      throw new Error(result.error.message);
    }

    // Basic safety logic: reject if nudity, weapons, alcohol, drugs, or offensive content is detected with high probability
    const isSafe = result.nudity.safe > 0.5 && 
                   result.weapon < 0.1 && 
                   result.alcohol < 0.2 && 
                   result.drugs < 0.2 && 
                   result.offensive.prob < 0.2;

    return { 
      safe: isSafe,
      details: result 
    };
  } catch (error) {
    console.error("Sightengine error:", error.response?.data?.error?.message || error.message);
    throw error;
  }
};

/**
 * Verifies if image contains food using Hugging Face Vit model.
 */
async function verifyFoodContent(imageBuffer) {
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  const FOOD_KEYWORDS = [
    'food', 'dish', 'cuisine', 'meal', 'breakfast', 'lunch', 'dinner', 'snack', 
    'drink', 'beverage', 'fruit', 'vegetable', 'meat', 'seafood', 'dessert', 
    'bread', 'cake', 'soup', 'rice', 'pasta', 'pizza', 'burger', 'sandwich', 
    'salad', 'curry', 'chicken', 'fish', 'beef', 'pork', 'egg', 'cheese', 
    'milk', 'coffee', 'tea', 'juice', 'hotdog', 'taco', 'burrito', 'sushi',
    'ramen', 'noodles', 'steak', 'pastry', 'cookie', 'pie', 'chocolate', 'ice cream'
  ];

  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224",
      {
        headers: { 
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/octet-stream"
        },
        method: "POST",
        body: imageBuffer,
      }
    );
    const result = await response.json();
    
    // LOGGING: Full Hugging Face API response
    console.log("Hugging Face Vit Model Response:", JSON.stringify(result, null, 2));

    if (Array.isArray(result) && result.length > 0) {
      // Check top 5 results
      const top5 = result.slice(0, 5);
      const topScoresLog = top5.map(r => `${r.label}: ${r.score.toFixed(4)}`).join(", ");
      console.log("Top Food Detection Scores:", topScoresLog);

      // Look for food-related keywords in any of the top 5 results
      const foodMatch = top5.find(prediction => {
        const label = prediction.label.toLowerCase();
        return prediction.score > 0.05 && (
          FOOD_KEYWORDS.some(keyword => label.includes(keyword))
        );
      });

      if (foodMatch) {
        console.log(`MATCH FOUND: ${foodMatch.label} (${foodMatch.score.toFixed(4)}) matches food criteria.`);
        return true;
      } else {
        console.log("REJECTION REASON: No food-related labels found in top 5 results with score > 0.05");
      }
    } else {
      console.log("REJECTION REASON: Invalid API response format or empty result.");
    }
  } catch (error) {
    console.error("Hugging Face API Error:", error.message);
    // On API failure, we might want to allow it or block it. 
    // Given requirements, we block it with a generic error if the detection fails.
  }

  throw new Error("Please upload a food-related image.");
}

/**
 * Uploads image to Cloudinary.
 */
const uploadToCloudinary = async (imageBuffer, folder = "posts") => {
  if (process.env.NODE_ENV === "test") {
    return { secure_url: "http://example.com/mock-image.jpg" };
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }).end(imageBuffer);
  });
};

/**
 * Validates text relevance using Groq.
 */
const validateFoodRelevance = async (text) => {
  if (process.env.NODE_ENV === "test") {
    return { relevant: true };
  }

  if (!groq) {
    console.warn("Groq not configured. Skipping text relevance check.");
    return { relevant: true };
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a content moderator for a food social media app. Determine if the user's text is related to food, cooking, or recipes. Respond with only 'YES' or 'NO'."
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const response = chatCompletion.choices[0].message.content.trim().toUpperCase();
    return { relevant: response === 'YES' };
  } catch (error) {
    console.error("Groq error:", error.message);
    // Fallback to true to not block users on API failure
    return { relevant: true };
  }
};

const { 
  RegExpMatcher, 
  englishDataset, 
  englishRecommendedTransformers 
} = require('obscenity');

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

/**
 * Moderates AI generated content
 * @param {string} text - Text to moderate
 * @returns {boolean} - True if clean, false if inappropriate
 */
const moderateAIContent = (text) => {
  if (!text) return true;
  return !matcher.hasMatch(text);
};

/**
 * Extracts public_id from a Cloudinary URL.
 * URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[extension]
 * @param {string} url - The full Cloudinary URL.
 * @returns {string|null} - The public_id or null if not a valid Cloudinary URL.
 */
const extractCloudinaryPublicId = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;

  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // After /upload/, skip the version (v12345678) if it exists
    const pathAfterUpload = parts[1];
    const pathParts = pathAfterUpload.split('/');
    
    // Remove the version part (starts with 'v')
    const finalPathParts = pathParts.filter(part => !part.startsWith('v') || isNaN(part.substring(1)));
    
    // Join back and remove file extension
    const fullPublicIdWithExt = finalPathParts.join('/');
    const lastDotIndex = fullPublicIdWithExt.lastIndexOf('.');
    
    if (lastDotIndex === -1) return fullPublicIdWithExt;
    return fullPublicIdWithExt.substring(0, lastDotIndex);
  } catch (error) {
    console.error("Error extracting Cloudinary Public ID:", error);
    return null;
  }
};

/**
 * Deletes an image from Cloudinary by its URL.
 * @param {string} url - The full Cloudinary URL.
 */
const deleteFromCloudinary = async (url) => {
  if (process.env.NODE_ENV === "test") return;
  
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`Failed to delete image from Cloudinary (${publicId}):`, error.message);
  }
};

module.exports = {
  generateHash,
  checkImageSafety,
  verifyFoodContent,
  uploadToCloudinary,
  validateFoodRelevance,
  moderateAIContent,
  extractCloudinaryPublicId,
  deleteFromCloudinary,
};
