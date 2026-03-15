const admin = require("../config/firebase");
const User = require("../models/User");
const BlockedSession = require("../models/BlockedSession");

const authMiddleware = async (req, res, next) => {
  console.log("authMiddleware hit for path:", req.path);
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    let decodedToken;
    // Enhanced Test Bypass: If we're in a testing environment and the token doesn't look like a JWT, 
    // treat it as a mock UID for backward compatibility with existing tests.
    if (process.env.NODE_ENV === 'test' && (!token.includes('.') || token === 'mock-token' || token === 'valid-token')) {
      decodedToken = {
        uid: token === 'valid-token' || token === 'mock-token' ? "mock-uid-123" : token,
        email: "mock@example.com"
      };
    } else {
      decodedToken = await admin.auth().verifyIdToken(token);
    }

    req.user = decodedToken;

    // Check if user session is explicitly blocked (force logout)
    const sessionBlocked = await BlockedSession.findOne({ firebaseUID: decodedToken.uid });
    if (sessionBlocked) {
      return res.status(401).json({ error: "Your account has been blocked by an admin. Please contact support." });
    }

    // Check if user is blocked in our DB
    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    if (user && user.isBlocked) {
      return res.status(401).json({ error: "Your account has been blocked by an admin. Please contact support." });
    }

    next();
  } catch (error) {
    console.error("Firebase auth error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * Optional authentication middleware.
 * If a valid token is provided, req.user is populated.
 * If no token is provided, it continues without req.user.
 * If an invalid token is provided, it returns 401.
 */
const optionalAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    let decodedToken;
    if (process.env.NODE_ENV === 'test' && (!token.includes('.') || token === 'mock-token' || token === 'valid-token')) {
      decodedToken = {
        uid: token === 'valid-token' || token === 'mock-token' ? "mock-uid-123" : token,
        email: "mock@example.com"
      };
    } else {
      decodedToken = await admin.auth().verifyIdToken(token);
    }

    req.user = decodedToken;

    // Check if user session is explicitly blocked
    const sessionBlocked = await BlockedSession.findOne({ firebaseUID: decodedToken.uid });
    if (sessionBlocked) {
      return res.status(401).json({ error: "Your account has been blocked by an admin. Please contact support." });
    }

    // Check if user is blocked
    const user = await User.findOne({ firebaseUID: decodedToken.uid });
    if (user && user.isBlocked) {
      return res.status(401).json({ error: "Your account has been blocked by an admin. Please contact support." });
    }

    next();
  } catch (error) {
    // If token is present but invalid, we should still fail for security consistency
    console.error("Firebase optional auth error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

const stripRole = (req, res, next) => {
  if (req.body && req.body.role) {
    delete req.body.role;
  }
  next();
};

module.exports = { authMiddleware, optionalAuthMiddleware, stripRole };
