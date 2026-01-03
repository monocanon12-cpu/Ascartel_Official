const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'ascartel.db');
const db = new Database(dbPath);

// Activer les clés étrangères
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
