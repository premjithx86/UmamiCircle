const admin = require("../config/firebase");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // If we're in a testing environment and the token is 'mock-token', bypass verification
    if (process.env.NODE_ENV === 'test' && token === 'mock-token') {
      req.user = {
        uid: "mock-uid-123",
        email: "mock@example.com"
      };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase auth error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

const stripRole = (req, res, next) => {
  if (req.body && req.body.role) {
    delete req.body.role;
  }
  next();
};

module.exports = { authMiddleware, stripRole };
