import { Injectable, OnModuleInit } from '@nestjs/common';
import Database = require('better-sqlite3');
import { join } from 'path';
import { DbTableInfo } from './database.types';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private db: Database.Database;

  constructor() {
    const dbPath = process.env.DATABASE_PATH || './database.sqlite';
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  onModuleInit() {
    this.initSchema();
  }

  getDb(): Database.Database {
    return this.db;
  }

  private initSchema() {
    // Check if we need to migrate the images table
    const tableInfo = this.db.pragma('table_info(images)') as DbTableInfo[];
    const hasFilepath = tableInfo.some((col) => col.name === 'filepath');
    const hasOriginalData = tableInfo.some(
      (col) => col.name === 'original_data',
    );

    if (hasFilepath && !hasOriginalData) {
      console.log('🔄 Migrating images table schema...');
      // Rename old table
      this.db.exec(`ALTER TABLE images RENAME TO images_old;`);
    }

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

    // If we migrated, copy data from old table (excluding image blobs)
    if (hasFilepath && !hasOriginalData) {
      console.log('📋 Copying metadata from old images table...');
      this.db.exec(`
        INSERT INTO images (id, progress_update_id, filename, caption, created_at)
        SELECT id, progress_update_id, filename, caption, created_at
        FROM images_old;
      `);
      console.log('✅ Images table migration complete!');
    }
  }

  onModuleDestroy() {
    this.db.close();
  }
}
