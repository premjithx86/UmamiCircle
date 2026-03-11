const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

/**
 * Middleware to authenticate admin requests using JWT.
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("No token provided");
    }

    const secret = process.env.JWT_ADMIN_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_ADMIN_SECRET is not defined in environment variables");
      return res.status(500).json({ error: "Internal server error" });
    }

    const decoded = jwt.verify(token, secret);   
    const admin = await Admin.findOne({ _id: decoded._id });

    if (!admin) {
      throw new Error("Admin not found");
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate as admin" });
  }
};

/**
 * Middleware to authorize specific admin roles.
 * @param {...string} roles - Allowed roles.
 * @returns {import('express').RequestHandler}
 */
const authorizeRoles = (...roles) => {  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        error: `Role (${req.admin.role}) is not allowed to access this resource` 
      });
    }
    next();
  };
};

module.exports = { adminAuth, authorizeRoles };
