const { db } = require("../db");

function getNextTaskId() {
  return db.data.tasks.length > 0
    ? Math.max(...db.data.tasks.map(task => task.id)) + 1
    : 1;
}

class Task {
  constructor(id, title, userId) {
    this.id = id;
    this.title = title;
    this.completed = false;
    this.userId = userId;
    this.createdAt = new Date().toISOString();
  }

  static async create(title, userId) {
    await db.read();
    const task = new Task(getNextTaskId(), title, userId);
    db.data.tasks.push(task);
    await db.write();
    return task;
  }

  static async getAll(userId) {
    await db.read();
    return db.data.tasks.filter(task => task.userId === userId);
  }

  static async getById(id) {
    await db.read();
    return db.data.tasks.find(task => task.id === id);
  }

  static async update(id, title, completed) {
    await db.read();
    const task = db.data.tasks.find(task => task.id === id);
    if (task) {
      task.title = title || task.title;
      task.completed = completed !== undefined ? completed : task.completed;
      await db.write();
    }
    return task;
  }

  static async delete(id) {
    await db.read();
    const index = db.data.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      db.data.tasks.splice(index, 1);
      await db.write();
      return true;
    }
    return false;
  }
}

module.exports = Task;