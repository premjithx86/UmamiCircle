const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // In a real app, verify with firebaseAdmin.auth().verifyIdToken(token)
  // For now, we mock the user based on the token
  req.user = {
    uid: "mock-uid-123", // For testing, this could be extracted from the token
    email: "mock@example.com"
  };
  next();
};

const stripRole = (req, res, next) => {
  if (req.body && req.body.role) {
    delete req.body.role;
  }
  next();
};

module.exports = { authMiddleware, stripRole };
