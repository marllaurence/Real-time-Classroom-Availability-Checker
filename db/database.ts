import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('classroom.db');

export const initDatabase = (): void => {
  try {
    db.execSync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'user')) NOT NULL DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS classrooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        capacity INTEGER NOT NULL,
        type TEXT NOT NULL, 
        status TEXT CHECK(status IN ('Available', 'Occupied', 'Reserved', 'Maintenance')) DEFAULT 'Available',
        equipment TEXT DEFAULT '' 
      );

      CREATE TABLE IF NOT EXISTS schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        professor TEXT NOT NULL,
        startTime TEXT NOT NULL, 
        endTime TEXT NOT NULL,
        dayOfWeek TEXT NOT NULL,
        FOREIGN KEY (room_id) REFERENCES classrooms(id) ON DELETE CASCADE
      );
    `);

    // Migration: Add equipment column if missing
    try {
      db.execSync("ALTER TABLE classrooms ADD COLUMN equipment TEXT DEFAULT ''");
    } catch (e) {
      // Column likely exists
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

export const runQuery = (sql: string, params: any[] = []): any[] => {
  try { return db.getAllSync(sql, params); } catch (error) { console.error("Query Error:", error); return []; }
};

export const runTransaction = (sql: string, params: any[] = []) => {
  try { return db.runSync(sql, params); } catch (error) { console.error("Transaction Error:", error); return null; }
};