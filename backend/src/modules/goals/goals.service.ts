import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { DbGoal, DbMilestone } from '../../database/database.types';

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  create(createGoalDto: CreateGoalDto) {
    try {
      this.logger.log(`Creating goal with data: ${JSON.stringify(createGoalDto)}`);
      const db = this.databaseService.getDb();
      const stmt = db.prepare(`
        INSERT INTO goals (goal_type_id, title, description, target_date, quarter, year)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        createGoalDto.goal_type_id || null,
        createGoalDto.title,
        createGoalDto.description || null,
        createGoalDto.target_date || null,
        createGoalDto.quarter || null,
        createGoalDto.year || null,
      );

      this.logger.log(`Goal created with ID: ${result.lastInsertRowid}`);
      return this.findOne(result.lastInsertRowid as number);
    } catch (error) {
      this.logger.error(`Failed to create goal: ${error.message}`, error.stack);
      throw error;
    }
  }

  findAll(status?: string) {
    const db = this.databaseService.getDb();
    let query = `
      SELECT g.*,
        gt.name as goal_type_name,
        gt.color as goal_type_color,
        gt.icon as goal_type_icon,
        COUNT(DISTINCT pu.id) as update_count,
        COUNT(DISTINCT i.id) as image_count,
        COALESCE(SUM(pu.progress_delta), 0) as progress
      FROM goals g
      LEFT JOIN goal_types gt ON g.goal_type_id = gt.id
      LEFT JOIN progress_updates pu ON g.id = pu.goal_id
      LEFT JOIN images i ON pu.id = i.progress_update_id
      WHERE g.deleted_at IS NULL
    `;

    if (status) {
      query += ` AND g.status = ?`;
    }

    query += ` GROUP BY g.id ORDER BY g.updated_at DESC`;

    const stmt = db.prepare(query);
    return status ? stmt.all(status) : stmt.all();
  }

  findOne(id: number) {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT g.*,
        gt.name as goal_type_name,
        gt.color as goal_type_color,
        gt.icon as goal_type_icon,
        COUNT(DISTINCT pu.id) as update_count,
        COUNT(DISTINCT i.id) as image_count,
        COALESCE(SUM(pu.progress_delta), 0) as progress
      FROM goals g
      LEFT JOIN goal_types gt ON g.goal_type_id = gt.id
      LEFT JOIN progress_updates pu ON g.id = pu.goal_id
      LEFT JOIN images i ON pu.id = i.progress_update_id
      WHERE g.id = ? AND g.deleted_at IS NULL
      GROUP BY g.id
    `);

    const goal = stmt.get(id) as DbGoal | undefined;
    if (!goal) {
      throw new NotFoundException(`Goal with ID ${id} not found`);
    }

    // Get tags
    const tagsStmt = db.prepare(`
      SELECT t.* FROM tags t
      INNER JOIN goal_tags gt ON t.id = gt.tag_id
      WHERE gt.goal_id = ?
    `);
    const tags = tagsStmt.all(id);

    // Get milestones
    const milestonesStmt = db.prepare(`
      SELECT * FROM milestones WHERE goal_id = ? ORDER BY threshold
    `);
    const milestones = milestonesStmt.all(id);

    return { ...goal, tags, milestones };
  }

  update(id: number, updateGoalDto: UpdateGoalDto) {
    const db = this.databaseService.getDb();

    // Check if goal exists
    this.findOne(id);

    const fields = [];
    const values = [];

    if (updateGoalDto.title !== undefined) {
      fields.push('title = ?');
      values.push(updateGoalDto.title);
    }
    if (updateGoalDto.description !== undefined) {
      fields.push('description = ?');
      values.push(updateGoalDto.description);
    }
    if (updateGoalDto.goal_type_id !== undefined) {
      fields.push('goal_type_id = ?');
      values.push(updateGoalDto.goal_type_id);
    }
    if (updateGoalDto.status !== undefined) {
      fields.push('status = ?');
      values.push(updateGoalDto.status);

      if (updateGoalDto.status === 'completed') {
        fields.push('completed_at = CURRENT_TIMESTAMP');
      }
    }
    if (updateGoalDto.progress !== undefined) {
      fields.push('progress = ?');
      values.push(updateGoalDto.progress);

      // Check milestones
      this.checkMilestones(id, updateGoalDto.progress);
    }
    if (updateGoalDto.target_date !== undefined) {
      fields.push('target_date = ?');
      values.push(updateGoalDto.target_date);
    }
    if (updateGoalDto.quarter !== undefined) {
      fields.push('quarter = ?');
      values.push(updateGoalDto.quarter);
    }
    if (updateGoalDto.year !== undefined) {
      fields.push('year = ?');
      values.push(updateGoalDto.year);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE goals SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = this.databaseService.getDb();

    // Check if goal exists
    this.findOne(id);

    // Soft delete by setting deleted_at timestamp
    const stmt = db.prepare('UPDATE goals SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);

    return { message: 'Goal deleted successfully' };
  }

  findDeleted() {
    const db = this.databaseService.getDb();
    const query = `
      SELECT g.*,
        gt.name as goal_type_name,
        gt.color as goal_type_color,
        gt.icon as goal_type_icon,
        COUNT(DISTINCT pu.id) as update_count,
        COUNT(DISTINCT i.id) as image_count,
        COALESCE(SUM(pu.progress_delta), 0) as progress
      FROM goals g
      LEFT JOIN goal_types gt ON g.goal_type_id = gt.id
      LEFT JOIN progress_updates pu ON g.id = pu.goal_id
      LEFT JOIN images i ON pu.id = i.progress_update_id
      WHERE g.deleted_at IS NOT NULL
      GROUP BY g.id
      ORDER BY g.deleted_at DESC
    `;

    const stmt = db.prepare(query);
    return stmt.all();
  }

  restore(id: number) {
    const db = this.databaseService.getDb();

    // Check if goal exists in trash
    const checkStmt = db.prepare('SELECT * FROM goals WHERE id = ? AND deleted_at IS NOT NULL');
    const goal = checkStmt.get(id);
    if (!goal) {
      throw new NotFoundException(`Deleted goal with ID ${id} not found`);
    }

    // Restore by clearing deleted_at
    const stmt = db.prepare('UPDATE goals SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);

    return this.findOne(id);
  }

  permanentDelete(id: number) {
    const db = this.databaseService.getDb();

    // Check if goal exists in trash
    const checkStmt = db.prepare('SELECT * FROM goals WHERE id = ? AND deleted_at IS NOT NULL');
    const goal = checkStmt.get(id);
    if (!goal) {
      throw new NotFoundException(`Deleted goal with ID ${id} not found`);
    }

    // Permanently delete from database
    const stmt = db.prepare('DELETE FROM goals WHERE id = ?');
    stmt.run(id);

    return { message: 'Goal permanently deleted' };
  }

  archive(id: number) {
    const db = this.databaseService.getDb();

    // Check if goal exists
    this.findOne(id);

    // Set status to completed and set completed_at
    const stmt = db.prepare(`
      UPDATE goals
      SET status = 'completed',
          completed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(id);

    return this.findOne(id);
  }

  private checkMilestones(goalId: number, progress: number) {
    const db = this.databaseService.getDb();

    // Get unachieved milestones that should be triggered
    const stmt = db.prepare(`
      SELECT * FROM milestones
      WHERE goal_id = ? AND achieved = 0 AND threshold <= ?
    `);

    const milestones = stmt.all(goalId, progress) as DbMilestone[];

    const updateStmt = db.prepare(`
      UPDATE milestones SET achieved = 1, achieved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    for (const milestone of milestones) {
      updateStmt.run(milestone.id);
    }

    return milestones;
  }

  getStats() {
    const db = this.databaseService.getDb();

    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total_goals,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_goals,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_goals,
        AVG(CASE WHEN status = 'active' THEN progress ELSE NULL END) as avg_progress
      FROM goals
    `);

    return stmt.get();
  }
}
