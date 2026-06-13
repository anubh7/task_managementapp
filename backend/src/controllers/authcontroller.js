const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

// Register a new user
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Create user
    const user = await User.create(username, password);

    if (!user) {
      return res.status(400).json({ message: "Username already exists" });
    }

    res.status(201).json({
      id: user.id,
      username: user.username,
      token: createToken(user),
      message: "User registered successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await User.findByUsername(username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({
      id: user.id,
      username: user.username,
      token: createToken(user),
      message: "Login successful"
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
};

module.exports = {
  register,
  login
};