const express = require("express");
const User = require("../models/User");
const { authMiddleware, stripRole } = require("../middleware/auth");
const router = express.Router();

// Sync user from Firebase with MongoDB using upsert
router.post("/sync", authMiddleware, async (req, res) => {
  try {
    const { username, name, email, dob } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // req.user is set by authMiddleware from the verified token
    const firebaseUID = req.user.uid;
    
    // Use findOneAndUpdate with upsert: true to create or update
    // If the user already exists, it will simply update and return the document
    const user = await User.findOneAndUpdate(
      { firebaseUID },
      { 
        $set: { email, dob },
        $setOnInsert: { 
          firebaseUID,
          username: username || email.split('@')[0], 
          name: name || email.split('@')[0]
        } 
      },
      { 
        upsert: true, 
        returnDocument: 'after', 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.status(200).json({ message: "User synced", user });
  } catch (error) {
    console.error("Sync error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUID: req.user.uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update current user profile
router.put("/me", authMiddleware, stripRole, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findOneAndUpdate(
      { firebaseUID: req.user.uid },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } }
      ]
    }).select("username name profilePicUrl bio")
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
