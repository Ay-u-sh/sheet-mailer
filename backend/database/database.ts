import Database from "better-sqlite3-multiple-ciphers";
import type { DatabaseConfig } from "../config/database.config.js";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function createDatabase(config: DatabaseConfig): Database.Database {
  const databasePath: string = resolve(config.path);

  mkdirSync(dirname(databasePath), { recursive: true });

  const database: Database.Database = new Database(databasePath);

  try {
    database.pragma(`key = "x'${config.encryptionKey}'"`);
    database.pragma("foreign_keys = ON");

    return database;
  } catch (error: unknown) {
    database.close();
    throw error;
  }
}

export function initializeDatabase(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS gmail_connections (
      user_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
      google_sub TEXT NOT NULL,
      email TEXT NOT NULL,
      encrypted_refresh_token TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS oauth_states_expires_at_idx
      ON oauth_states(expires_at);
  `);
}