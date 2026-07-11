const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/memory.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
