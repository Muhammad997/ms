const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/memory.db', (err) => {
  if (err) {
    console.error('❌ SQLite Error:', err);
  } else {
    console.log('✅ SQLite Connected');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Create Table Error:', err);
    } else {
      console.log('✅ Memory Table Ready');
    }
  });
});

module.exports = db;
