const User = require("../models/user");

const updateLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ message: "Latitude and longitude must be numbers" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.location = {
      latitude,
      longitude,
      updatedAt: new Date().toISOString()
    };

    await User.save(user);

    res.json({ message: "Location updated", location: user.location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating location" });
  }
};

const getLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ location: user.location || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching location" });
  }
};

module.exports = {
  updateLocation,
  getLocation
};
