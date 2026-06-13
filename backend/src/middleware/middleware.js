// Simple authentication middleware
// In real app, this would verify JWT tokens
const authMiddleware = (req, res, next) => {
  // Get userId from headers (in real app, extract from JWT)
  const userId = req.headers["user-id"];

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  // Attach userId to request object
  req.userId = parseInt(userId);
  next();
};

module.exports = { authMiddleware };