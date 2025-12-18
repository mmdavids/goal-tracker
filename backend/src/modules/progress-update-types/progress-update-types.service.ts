import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProgressUpdateTypeDto } from './dto/create-progress-update-type.dto';
import { UpdateProgressUpdateTypeDto } from './dto/update-progress-update-type.dto';
import { DbProgressUpdateType } from '../../database/database.types';

@Injectable()
export class ProgressUpdateTypesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createProgressUpdateTypeDto: CreateProgressUpdateTypeDto) {
    const db = this.databaseService.getDb();

    try {
      const stmt = db.prepare(`
        INSERT INTO progress_update_types (name, description, emoji)
        VALUES (?, ?, ?)
      `);

      const result = stmt.run(
        createProgressUpdateTypeDto.name,
        createProgressUpdateTypeDto.description || null,
        createProgressUpdateTypeDto.emoji || '📝',
      );

      return this.findOne(result.lastInsertRowid as number);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException('Progress update type with this name already exists');
      }
      throw error;
    }
  }

  findAll() {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT put.*,
        COUNT(pu.id) as update_count
      FROM progress_update_types put
      LEFT JOIN progress_updates pu ON put.id = pu.progress_update_type_id
      GROUP BY put.id
      ORDER BY put.name
    `);
    return stmt.all();
  }

  findOne(id: number) {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT put.*,
        COUNT(pu.id) as update_count
      FROM progress_update_types put
      LEFT JOIN progress_updates pu ON put.id = pu.progress_update_type_id
      WHERE put.id = ?
      GROUP BY put.id
    `);

    const progressUpdateType = stmt.get(id);
    if (!progressUpdateType) {
      throw new NotFoundException(`Progress update type with ID ${id} not found`);
    }

    return progressUpdateType;
  }

  update(id: number, updateProgressUpdateTypeDto: UpdateProgressUpdateTypeDto) {
    const db = this.databaseService.getDb();

    // Check if progress update type exists
    this.findOne(id);

    const fields = [];
    const values = [];

    if (updateProgressUpdateTypeDto.name !== undefined) {
      fields.push('name = ?');
      values.push(updateProgressUpdateTypeDto.name);
    }
    if (updateProgressUpdateTypeDto.description !== undefined) {
      fields.push('description = ?');
      values.push(updateProgressUpdateTypeDto.description);
    }
    if (updateProgressUpdateTypeDto.emoji !== undefined) {
      fields.push('emoji = ?');
      values.push(updateProgressUpdateTypeDto.emoji);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    values.push(id);

    try {
      const stmt = db.prepare(`
        UPDATE progress_update_types SET ${fields.join(', ')} WHERE id = ?
      `);

      stmt.run(...values);
      return this.findOne(id);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException('Progress update type with this name already exists');
      }
      throw error;
    }
  }

  remove(id: number) {
    const db = this.databaseService.getDb();

    // Check if progress update type exists
    const progressUpdateType = this.findOne(id) as DbProgressUpdateType;

    // Check if progress update type is being used
    if (progressUpdateType.update_count > 0) {
      throw new ConflictException(
        `Cannot delete progress update type that is used by ${progressUpdateType.update_count} update(s)`,
      );
    }

    const stmt = db.prepare('DELETE FROM progress_update_types WHERE id = ?');
    stmt.run(id);

    return { message: 'Progress update type deleted successfully' };
  }
}
