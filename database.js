const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./memory.db');

db.serialize(() => {
db.run(`     CREATE TABLE IF NOT EXISTS memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function saveMessage(user, message) {
db.run(
'INSERT INTO memory (user, message) VALUES (?, ?)',
[user, message]
);
}

function getHistory(user, limit = 10) {
return new Promise((resolve, reject) => {
db.all(
'SELECT message FROM memory WHERE user = ? ORDER BY id DESC LIMIT ?',
[user, limit],
(err, rows) => {
if (err) reject(err);
else resolve(rows.map(r => r.message).reverse());
}
);
});
}

module.exports = {
db,
saveMessage,
getHistory
};
