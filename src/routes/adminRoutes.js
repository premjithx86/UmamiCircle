const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { adminAuth, authorizeRoles } = require("../middleware/adminAuth");
const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }

    const token = jwt.sign(
      { _id: admin._id.toString(), role: admin.role },
      process.env.JWT_ADMIN_SECRET || "supersecretadminkey",
      { expiresIn: "24h" }
    );

    res.status(200).json({ admin, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current admin info
router.get("/me", adminAuth, async (req, res) => {
  res.status(200).json(req.admin);
});

// Test route for SuperAdmin only
router.get("/super-only", adminAuth, authorizeRoles("SuperAdmin"), (req, res) => {
  res.status(200).json({ message: "Welcome SuperAdmin" });
});

module.exports = router;
