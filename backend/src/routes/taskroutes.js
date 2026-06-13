const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskcontroller");
const locationController = require("../controllers/locationcontroller");
const { authMiddleware } = require("../middleware/authmiddleware");

// All routes require authentication
router.use(authMiddleware);

// Get all tasks
router.get("/", taskController.getAllTasks);

// Create a task
router.post("/", taskController.createTask);

// Update a task
router.put("/:id", taskController.updateTask);

// Delete a task
router.delete("/:id", taskController.deleteTask);

// Update user location
router.post("/location", locationController.updateLocation);

// Get user location
router.get("/location", locationController.getLocation);

module.exports = router;
