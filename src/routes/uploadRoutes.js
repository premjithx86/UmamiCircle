const express = require("express");
const router = express.Router();
const { upload, processImageModeration } = require("../middleware/uploadMiddleware");
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

module.exports = router;
