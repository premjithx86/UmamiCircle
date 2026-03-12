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
 * Verifies if image contains food using Hugging Face food detection model.
 */
async function verifyFoodContent(imageBuffer) {
  if (process.env.NODE_ENV === "test") {
    return true;
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/nateraw/food",
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
  
  // If result is an array with at least one classification, it's food
  if (Array.isArray(result) && result.length > 0 && result[0].score > 0.1) {
    return true; // food detected
  }
  throw new Error("Please upload food-related content.");
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

module.exports = {
  generateHash,
  checkImageSafety,
  verifyFoodContent,
  uploadToCloudinary,
  validateFoodRelevance,
};
