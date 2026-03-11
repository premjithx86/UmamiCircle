const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // In a real app, verify with firebaseAdmin.auth().verifyIdToken(token)
  // For testing, we extract the uid from "Bearer <uid>"
  const uid = token.split(" ")[1] || "mock-uid-123";
  
  req.user = {
    uid: uid,
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
