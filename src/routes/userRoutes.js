const express = require("express");
const User = require("../models/User");
const { authMiddleware, stripRole } = require("../middleware/auth");
const router = express.Router();

// Sync user from Firebase with MongoDB
router.post("/sync", authMiddleware, async (req, res) => {
  try {
    const { username, name, email } = req.body;
    // req.user is set by authMiddleware
    const firebaseUID = req.user.uid;
    
    let user = await User.findOne({ firebaseUID });
    
    if (!user) {
      user = new User({
        firebaseUID,
        username,
        name,
        email
      });
      await user.save();
      return res.status(201).json({ message: "User created", user });
    }
    
    res.status(200).json({ message: "User found", user });
  } catch (error) {
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
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
