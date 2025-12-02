import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import * as sharp from 'sharp';
import { DbImage } from '../../database/database.types';

@Injectable()
export class ImagesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    progressUpdateId: number,
    files: Express.Multer.File[],
    captions?: string[],
  ) {
    const db = this.databaseService.getDb();

    // Check if progress update exists
    const updateStmt = db.prepare('SELECT * FROM progress_updates WHERE id = ?');
    const update = updateStmt.get(progressUpdateId);
    if (!update) {
      throw new NotFoundException(
        `Progress update with ID ${progressUpdateId} not found`,
      );
    }

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const filename = `${timestamp}-${i}.webp`;

      try {
        // Process original (max 1920px width)
        const originalBuffer = await sharp(file.buffer)
          .resize(1920, null, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();

        // Generate thumbnail (400px width)
        const thumbnailBuffer = await sharp(file.buffer)
          .resize(400, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        // Save to database
        const stmt = db.prepare(`
          INSERT INTO images (progress_update_id, filename, original_data, thumbnail_data, mime_type, caption)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
          progressUpdateId,
          filename,
          originalBuffer,
          thumbnailBuffer,
          'image/webp',
          captions?.[i] || null,
        );

        results.push({
          id: result.lastInsertRowid,
          filename,
          caption: captions?.[i] || null,
        });
      } catch (error) {
        console.error('Error processing image:', error);
        throw error;
      }
    }

    return results;
  }

  async remove(id: number) {
    const db = this.databaseService.getDb();

    // Check if image exists
    const stmt = db.prepare('SELECT id FROM images WHERE id = ?');
    const image = stmt.get(id) as { id: number } | undefined;

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    // Delete from database
    const deleteStmt = db.prepare('DELETE FROM images WHERE id = ?');
    deleteStmt.run(id);

    return { message: 'Image deleted successfully' };
  }

  getImage(filename: string, type: 'original' | 'thumbnail' = 'original') {
    const db = this.databaseService.getDb();
    const column = type === 'thumbnail' ? 'thumbnail_data' : 'original_data';

    const stmt = db.prepare(
      `SELECT ${column} as data, mime_type FROM images WHERE filename = ?`,
    );
    const result = stmt.get(filename) as { data: Buffer; mime_type: string } | undefined;

    if (!result) {
      throw new NotFoundException('Image not found');
    }

    return {
      data: result.data,
      mimeType: result.mime_type,
    };
  }
}
