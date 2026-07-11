const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/memory.db', (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('✅ SQLite Connected');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Create table error:', err);
    } else {
      console.log('✅ Memory table ready');
    }
  });
});

module.exports = db;
