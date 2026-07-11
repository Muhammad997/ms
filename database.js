const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./memory.db');

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

db.serialize(() => {
  console.log('Creating memory table...');

  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Create table failed:', err);
    } else {
      console.log('Memory table ready');
    }
  });
});
