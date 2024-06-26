import { SQLiteDatabase } from 'expo-sqlite/next';

export async function databaseInit(db: SQLiteDatabase) {
  db.execAsync(`
    PRAGMA journal_mode = 'wal';
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
        address TEXT PRIMARY KEY,
        publicKey TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chatId TEXT NOT NULL,
        sender TEXT NOT NULL,
        receiver TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        state TEXT DEFAULT 'PENDING',
        FOREIGN KEY (sender) REFERENCES users(address) ON DELETE CASCADE ON UPDATE RESTRICT,
        FOREIGN KEY (receiver) REFERENCES users(address) ON DELETE CASCADE ON UPDATE RESTRICT
    );
  `);
}
