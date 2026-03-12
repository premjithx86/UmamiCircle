const multer = require("multer");
const { generateHash, checkImageSafety, verifyFoodContent, uploadToCloudinary } = require("../services/moderationService");
const Post = require("../models/Post"); // To check for existing hashes

// Use memory storage to handle the buffer directly for hashing and moderation
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"), false);
    }
  },
});

/**
 * Middleware to process, moderate, and upload the image.
 */
const processImageModeration = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  try {
    // 1. Generate Hash for Deduplication
    const hash = generateHash(req.file.buffer);
    req.imageHash = hash;

    // Check if image already exists in DB (Deduplication)
    const existingPost = await Post.findOne({ imageHash: hash });
    if (existingPost) {
      req.imageUrl = existingPost.imageUrl;
      req.isDuplicate = true;
      return next(); // Skip further moderation and upload
    }

    // 2. NSFW Check (Sightengine)
    const safety = await checkImageSafety(req.file.buffer);
    if (!safety.safe) {
      return res.status(400).json({ error: "Image failed safety check (NSFW detected)" });
    }

    // 3. Food Content Check (Hugging Face)
    try {
      await verifyFoodContent(req.file.buffer);
    } catch (foodError) {
      return res.status(400).json({ error: foodError.message });
    }

    // 4. Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    req.imageUrl = uploadResult.secure_url;
    req.isDuplicate = false;

    next();
  } catch (error) {
    console.error("Moderation pipeline error:", error);
    res.status(500).json({ error: "Failed to process image moderation" });
  }
};

module.exports = {
  upload,
  processImageModeration,
};
