const multer = require("multer");
const { generateHash, checkImageSafety, verifyFoodContent, uploadToCloudinary } = require("../services/moderationService");
const ModerationCache = require("../models/ModerationCache");

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
 * Middleware to process, moderate, and upload the image with deduplication.
 */
const processImageModeration = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  try {
    // 1. Generate Hash for Deduplication
    const hash = generateHash(req.file.buffer);
    req.imageHash = hash;

    // 2. Check Moderation Cache
    const cachedResult = await ModerationCache.findOne({ imageHash: hash });
    
    if (cachedResult) {
      if (cachedResult.status === 'rejected') {
        return res.status(400).json({ 
          error: cachedResult.reason || "Image previously rejected by moderation" 
        });
      }
      
      if (cachedResult.status === 'approved') {
        req.imageUrl = cachedResult.cloudinaryUrl;
        req.isDuplicate = true;
        return next();
      }
    }

    // 3. NSFW Check (Sightengine)
    const safety = await checkImageSafety(req.file.buffer);
    if (!safety.safe) {
      // Save rejection to cache
      await ModerationCache.create({
        imageHash: hash,
        status: 'rejected',
        reason: "Image failed safety check (NSFW detected)"
      });
      return res.status(400).json({ error: "Image failed safety check (NSFW detected)" });
    }

    // 4. Food Content Check (Hugging Face)
    try {
      await verifyFoodContent(req.file.buffer);
    } catch (foodError) {
      // Save rejection to cache
      await ModerationCache.create({
        imageHash: hash,
        status: 'rejected',
        reason: foodError.message
      });
      return res.status(400).json({ error: foodError.message });
    }

    // 5. Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    req.imageUrl = uploadResult.secure_url;
    req.isDuplicate = false;

    // 6. Save approval to cache
    await ModerationCache.create({
      imageHash: hash,
      status: 'approved',
      cloudinaryUrl: uploadResult.secure_url
    });

    next();
  } catch (error) {
    console.error("Moderation pipeline error:", error);
    res.status(500).json({ error: "Failed to process image moderation" });
  }
};

/**
 * Middleware for avatar moderation (NSFW only, skip food check)
 * Implements MD5 hashing and deduplication.
 */
const processAvatarModeration = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded" });
  }

  try {
    const imageBuffer = req.file.buffer;
    
    // 1. Generate Hash for Deduplication
    const hash = generateHash(imageBuffer);
    req.imageHash = hash;

    // 2. Check Moderation Cache
    const cachedResult = await ModerationCache.findOne({ imageHash: hash });
    
    if (cachedResult) {
      if (cachedResult.status === 'rejected') {
        return res.status(400).json({ 
          error: cachedResult.reason || "Inappropriate content detected. Please upload a safe profile picture." 
        });
      }
      
      if (cachedResult.status === 'approved') {
        req.imageUrl = cachedResult.cloudinaryUrl;
        req.isDuplicate = true;
        return next();
      }
    }

    // 3. NSFW Check (Sightengine)
    const safety = await checkImageSafety(imageBuffer);
    if (!safety.safe) {
      // Save rejection to cache
      await ModerationCache.create({
        imageHash: hash,
        status: 'rejected',
        reason: "Inappropriate content detected. Please upload a safe profile picture."
      });
      return res.status(400).json({ error: "Inappropriate content detected. Please upload a safe profile picture." });
    }

    // 4. Upload to Cloudinary (in 'avatars' folder)
    const result = await uploadToCloudinary(imageBuffer, "avatars");
    req.imageUrl = result.secure_url;
    req.isDuplicate = false;

    // 5. Save approval to cache
    await ModerationCache.create({
      imageHash: hash,
      status: 'approved',
      cloudinaryUrl: result.secure_url
    });
    
    next();
  } catch (error) {
    console.error("Avatar moderation error:", error);
    res.status(500).json({ error: error.message || "Moderation failed" });
  }
};

module.exports = {
  upload,
  processImageModeration,
  processAvatarModeration
};
