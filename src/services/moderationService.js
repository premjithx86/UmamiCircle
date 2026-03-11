const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const vision = require("@google-cloud/vision");
const Sightengine = require("sightengine");
const { Groq } = require("groq-sdk");

// Configure Cloudinary (Assuming environment variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sightengine = process.env.SIGHTENGINE_API_USER 
  ? Sightengine(process.env.SIGHTENGINE_API_USER, process.env.SIGHTENGINE_API_SECRET)
  : null;

const visionClient = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? new vision.ImageAnnotatorClient()
  : null;

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
 * Checks image safety using Sightengine.
 * Mocked for now to avoid real API calls.
 */
const checkImageSafety = async (imageBuffer) => {
  if (process.env.NODE_ENV === "test") {
    return { safe: true };
  }
  // Real implementation would use sightengine.check(['nudity', 'wad', 'offensive'])
  return { safe: true };
};

/**
 * Verifies if image contains food using Google Cloud Vision.
 * Mocked for now.
 */
const verifyFoodContent = async (imageBuffer) => {
  if (process.env.NODE_ENV === "test") {
    return { isFood: true };
  }
  return { isFood: true };
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
 * Mocked for now.
 */
const validateFoodRelevance = async (text) => {
  if (process.env.NODE_ENV === "test") {
    return { relevant: true };
  }
  return { relevant: true };
};

module.exports = {
  generateHash,
  checkImageSafety,
  verifyFoodContent,
  uploadToCloudinary,
  validateFoodRelevance,
};
