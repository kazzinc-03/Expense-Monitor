import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, 'expenses.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    purpose TEXT NOT NULL,
    mode TEXT NOT NULL
  )
`);

export = db; // ✅ Use CommonJS-style export
