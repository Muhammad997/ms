const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/memory.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ SQLite Error:', err.message);
    } else {
        console.log('✅ SQLite Connected');
    }
});

function initDB() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                role TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });
}

function saveMessage(user, role, message) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO chats (user, role, message) VALUES (?, ?, ?)`,
            [user, role, message],
            function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            }
        );
    });
}

function getHistory(user, limit = 10) {
    return new Promise((resolve, reject) => {
        db.all(
            `
            SELECT role, message
            FROM chats
            WHERE user = ?
            ORDER BY id DESC
            LIMIT ?
            `,
            [user, limit],
            (err, rows) => {
                if (err) return reject(err);

                resolve(rows.reverse());
            }
        );
    });
}

function clearHistory(user) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM chats WHERE user = ?`,
            [user],
            function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            }
        );
    });
}

module.exports = {
    db,
    initDB,
    saveMessage,
    getHistory,
    clearHistory
};
