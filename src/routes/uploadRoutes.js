const express = require("express");
const router = express.Router();
const { upload, processImageModeration, processAvatarModeration } = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/auth");

/**
 * @route POST /api/upload
 * @desc Moderate and upload an image
 * @access Private
 */
router.post("/", authMiddleware, upload.single("image"), processImageModeration, async (req, res) => {
  try {
    res.status(200).json({
      message: req.isDuplicate ? "Duplicate image detected." : "Image uploaded successfully.",
      imageUrl: req.imageUrl,
      imageHash: req.imageHash,
    });
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ error: "Failed to return upload response" });
  }
});

/**
 * @route POST /api/upload/avatar
 * @desc Moderate and upload a profile picture (NSFW check only)
 * @access Private
 */
router.post("/avatar", authMiddleware, upload.single("image"), processAvatarModeration, async (req, res) => {
  try {
    res.status(200).json({
      message: "Avatar uploaded successfully.",
      imageUrl: req.imageUrl
    });
  } catch (error) {
    console.error("Avatar upload route error:", error);
    res.status(500).json({ error: "Failed to return avatar upload response" });
  }
});

module.exports = router;
