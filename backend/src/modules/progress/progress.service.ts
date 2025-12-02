import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { DbGoal, DbProgressUpdate } from '../../database/database.types';

@Injectable()
export class ProgressService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(goalId: number, createProgressDto: CreateProgressDto) {
    const db = this.databaseService.getDb();

    // Check if goal exists
    const goalStmt = db.prepare('SELECT * FROM goals WHERE id = ?');
    const goal = goalStmt.get(goalId) as DbGoal | undefined;
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    // Insert progress update, defaulting date_achieved to CURRENT_TIMESTAMP if not provided
    const stmt = db.prepare(`
      INSERT INTO progress_updates (goal_id, title, notes, progress_delta, date_achieved)
      VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
    `);

    const result = stmt.run(
      goalId,
      createProgressDto.title,
      createProgressDto.notes || null,
      createProgressDto.progress_delta || 0,
      createProgressDto.date_achieved || null,
    );

    // Update goal's updated_at timestamp
    const updateGoalStmt = db.prepare(`
      UPDATE goals SET updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateGoalStmt.run(goalId);

    return this.findOne(result.lastInsertRowid as number);
  }

  findAllByGoal(goalId: number) {
    const db = this.databaseService.getDb();

    // Check if goal exists
    const goalStmt = db.prepare('SELECT * FROM goals WHERE id = ?');
    const goal = goalStmt.get(goalId);
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    const stmt = db.prepare(`
      SELECT pu.*,
        COUNT(DISTINCT i.id) as image_count
      FROM progress_updates pu
      LEFT JOIN images i ON pu.id = i.progress_update_id
      WHERE pu.goal_id = ?
      GROUP BY pu.id
      ORDER BY COALESCE(pu.date_achieved, pu.created_at) DESC
    `);

    const updates = stmt.all(goalId);

    // Get images for each update
    const imageStmt = db.prepare(`
      SELECT * FROM images WHERE progress_update_id = ?
    `);

    return updates.map((update: any) => ({
      ...update,
      images: imageStmt.all(update.id),
    }));
  }

  findOne(id: number) {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT pu.*,
        COUNT(DISTINCT i.id) as image_count
      FROM progress_updates pu
      LEFT JOIN images i ON pu.id = i.progress_update_id
      WHERE pu.id = ?
      GROUP BY pu.id
    `);

    const update = stmt.get(id) as DbProgressUpdate | undefined;
    if (!update) {
      throw new NotFoundException(`Progress update with ID ${id} not found`);
    }

    // Get images
    const imageStmt = db.prepare(`
      SELECT * FROM images WHERE progress_update_id = ?
    `);
    const images = imageStmt.all(id);

    return { ...update, images };
  }

  update(id: number, updateProgressDto: UpdateProgressDto) {
    const db = this.databaseService.getDb();

    // Check if update exists
    this.findOne(id);

    const fields = [];
    const values = [];

    if (updateProgressDto.title !== undefined) {
      fields.push('title = ?');
      values.push(updateProgressDto.title);
    }
    if (updateProgressDto.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updateProgressDto.notes);
    }
    if (updateProgressDto.progress_delta !== undefined) {
      fields.push('progress_delta = ?');
      values.push(updateProgressDto.progress_delta);
    }
    if (updateProgressDto.date_achieved !== undefined) {
      fields.push('date_achieved = ?');
      values.push(updateProgressDto.date_achieved);
    }

    values.push(id);

    const stmt = db.prepare(`
      UPDATE progress_updates SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = this.databaseService.getDb();

    // Check if update exists
    this.findOne(id);

    const stmt = db.prepare('DELETE FROM progress_updates WHERE id = ?');
    stmt.run(id);

    return { message: 'Progress update deleted successfully' };
  }
}
