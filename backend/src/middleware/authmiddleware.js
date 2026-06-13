const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

// JWT-based authentication middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    req.username = payload.username;
    req.isAdmin = payload.isAdmin || false;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { authMiddleware };