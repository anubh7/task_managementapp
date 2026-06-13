const bcrypt = require("bcryptjs");
const { db } = require("../db");

function getNextUserId() {
  return db.data.users.length > 0
    ? Math.max(...db.data.users.map(user => user.id)) + 1
    : 1;
}

class User {
  constructor(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password; // hashed password
    this.createdAt = new Date().toISOString();
  }

  static async create(username, password) {
    await db.read();

    const existingUser = db.data.users.find(u => u.username === username);
    if (existingUser) {
      return null; // User already exists
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = new User(getNextUserId(), username, hashedPassword);
    db.data.users.push(user);
    await db.write();
    return user;
  }

  static async findByUsername(username) {
    await db.read();
    return db.data.users.find(user => user.username === username);
  }

  static async findById(id) {
    await db.read();
    return db.data.users.find(user => user.id === id);
  }

  static async getAll() {
    await db.read();
    return db.data.users;
  }

  static async save(user) {
    await db.read();
    const index = db.data.users.findIndex(u => u.id === user.id);
    if (index === -1) {
      return null;
    }

    db.data.users[index] = user;
    await db.write();
    return user;
  }
}

module.exports = User;