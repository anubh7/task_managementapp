const Task = require("../models/task");

// Get all tasks for a user
const getAllTasks = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware
    const tasks = await Task.getAll(userId);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.userId;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create(title, userId);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task" });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const task = await Task.update(parseInt(id, 10), title, completed);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Task.delete(parseInt(id, 10));

    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
};