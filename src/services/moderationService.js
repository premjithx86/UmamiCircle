const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const Sightengine = require("sightengine");
const { Groq } = require("groq-sdk");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sightengine = process.env.SIGHTENGINE_API_USER 
  ? new Sightengine(process.env.SIGHTENGINE_API_USER, process.env.SIGHTENGINE_API_SECRET)
  : null;

const groq = process.env.GROQ_API_KEY 
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const GOOGLE_VISION_KEY = process.env.GOOGLE_VISION_KEY;

/**
 * Generates an MD5 hash of a buffer.
 * Used for image deduplication.
 */
const generateHash = (buffer) => {
  return crypto.createHash("md5").update(buffer).digest("hex");
};

/**
 * Checks image safety using Sightengine.
 */
const checkImageSafety = async (imageBuffer) => {
  if (process.env.NODE_ENV === "test") {
    return { safe: true };
  }

  if (!sightengine) {
    console.warn("Sightengine not configured. Skipping safety check.");
    return { safe: true };
  }

  try {
    const result = await sightengine.check(['nudity', 'wad', 'offensive']).set_bytes(imageBuffer);
    
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
    console.error("Sightengine error:", error.message);
    throw error;
  }
};

/**
 * Verifies if image contains food using Google Cloud Vision REST API.
 */
const verifyFoodContent = async (imageBuffer) => {
  if (process.env.NODE_ENV === "test") {
    return { isFood: true };
  }

  if (!GOOGLE_VISION_KEY) {
    console.warn("GOOGLE_VISION_KEY not configured. Skipping food verification.");
    return { isFood: true };
  }

  try {
    const base64Image = imageBuffer.toString('base64');
    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_KEY}`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: 'LABEL_DETECTION', maxResults: 10 }]
          }
        ]
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const labels = data.responses[0].labelAnnotations || [];
    
    // Check if any label is related to food
    const foodKeywords = ['Food', 'Cuisine', 'Dish', 'Ingredient', 'Produce', 'Meal', 'Recipe', 'Vegetable', 'Fruit', 'Meat', 'Dessert', 'Baking'];
    const isFood = labels.some(label => 
      foodKeywords.some(keyword => label.description.includes(keyword)) && label.score > 0.6
    );

    return { 
      isFood, 
      labels: labels.map(l => l.description) 
    };
  } catch (error) {
    console.error("Google Vision error:", error.message);
    throw error;
  }
};

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

module.exports = {
  generateHash,
  checkImageSafety,
  verifyFoodContent,
  uploadToCloudinary,
  validateFoodRelevance,
};
