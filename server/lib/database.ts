import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Ensure database directory exists
const dbPath = path.join(process.cwd(), 'data/boardgame-toolkit.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Shared database connection
export const db = new Database(dbPath);

// Initialize all tables
export function initializeDatabase() {
  // Templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      templateId INTEGER PRIMARY KEY AUTOINCREMENT,
      definition TEXT
    )
  `);

  // Global variables table
  db.exec(`
    CREATE TABLE IF NOT EXISTS global_variables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Components table
  db.exec(`
    CREATE TABLE IF NOT EXISTS components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      definition TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tiles (
      tileId INTEGER PRIMARY KEY AUTOINCREMENT,
      definition TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Maps table
  db.exec(`
    CREATE TABLE IF NOT EXISTS maps (
      mapId INTEGER PRIMARY KEY AUTOINCREMENT,
      definition TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Initialize database on import
initializeDatabase();
