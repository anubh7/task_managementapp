const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "../data/db.json");
const adapter = new JSONFile(filePath);
const db = new Low(adapter, { users: [], tasks: [] });

async function initDb() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ users: [], tasks: [] }, null, 2), "utf8");
  }

  await db.read();
  db.data ||= { users: [], tasks: [] };
  await db.write();
}

module.exports = { db, initDb };