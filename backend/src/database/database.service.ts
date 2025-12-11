import { Injectable, OnModuleInit } from '@nestjs/common';
import Database = require('better-sqlite3');
import { join, dirname } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Database.Database;

  constructor() {
    const dbPath = this.getDbPath();
    this.ensureDbDirectoryExists(dbPath);
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    console.log(`📁 Database location: ${dbPath}`);
  }

  private getDbPath(): string {
    // Priority: 1. Environment variable, 2. Config file, 3. Default
    if (process.env.DATABASE_PATH) {
      console.log('📍 Using database path from environment variable');
      return process.env.DATABASE_PATH;
    }

    // Check config file
    try {
      const configPath = join(process.cwd(), 'config.json');
      if (existsSync(configPath)) {
        const configFile = require('fs').readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configFile);
        if (config.databasePath && config.databasePath.trim()) {
          console.log('📍 Using database path from config.json');
          return config.databasePath;
        }
      }
    } catch (error) {
      console.warn('⚠️  Failed to read config file, using default:', error);
    }

    // Default to user's home directory in a .goal-tracker folder
    console.log('📍 Using default database path');
    const homeDir = homedir();
    const appDataDir = join(homeDir, '.goal-tracker');
    return join(appDataDir, 'database.sqlite');
  }

  private ensureDbDirectoryExists(dbPath: string): void {
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📂 Created database directory: ${dir}`);
    }
  }

  onModuleInit() {
    this.initSchema();
  }

  getDb(): Database.Database {
    return this.db;
  }

  private initSchema() {
    console.log('📋 Initializing database schema...');

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS goal_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        color TEXT DEFAULT '#3b82f6',
        icon TEXT DEFAULT '🎯',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_type_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        progress INTEGER DEFAULT 0,
        target_date DATE,
        quarter TEXT,
        year INTEGER,
        emoji TEXT DEFAULT '🎯',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        deleted_at DATETIME,
        FOREIGN KEY (goal_type_id) REFERENCES goal_types(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS progress_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        notes TEXT,
        progress_delta INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_achieved DATETIME,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        progress_update_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_data BLOB,
        thumbnail_data BLOB,
        mime_type TEXT DEFAULT 'image/webp',
        caption TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (progress_update_id) REFERENCES progress_updates(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        threshold INTEGER NOT NULL,
        achieved BOOLEAN DEFAULT 0,
        achieved_at DATETIME,
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#3b82f6'
      );

      CREATE TABLE IF NOT EXISTS goal_tags (
        goal_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (goal_id, tag_id),
        FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

    `);

    console.log('✅ Database schema initialized');
  }

  onModuleDestroy() {
    this.db.close();
  }
}
