import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateGoalTypeDto } from './dto/create-goal-type.dto';
import { UpdateGoalTypeDto } from './dto/update-goal-type.dto';
import { DbGoalType } from '../../database/database.types';

@Injectable()
export class GoalTypesService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createGoalTypeDto: CreateGoalTypeDto) {
    const db = this.databaseService.getDb();

    try {
      const stmt = db.prepare(`
        INSERT INTO goal_types (name, description, color, icon)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(
        createGoalTypeDto.name,
        createGoalTypeDto.description || null,
        createGoalTypeDto.color || '#3b82f6',
        createGoalTypeDto.icon || '🎯',
      );

      return this.findOne(result.lastInsertRowid as number);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException('Goal type with this name already exists');
      }
      throw error;
    }
  }

  findAll() {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT gt.*,
        COUNT(g.id) as goal_count
      FROM goal_types gt
      LEFT JOIN goals g ON gt.id = g.goal_type_id
      GROUP BY gt.id
      ORDER BY gt.name
    `);
    return stmt.all();
  }

  findOne(id: number) {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT gt.*,
        COUNT(g.id) as goal_count
      FROM goal_types gt
      LEFT JOIN goals g ON gt.id = g.goal_type_id
      WHERE gt.id = ?
      GROUP BY gt.id
    `);

    const goalType = stmt.get(id);
    if (!goalType) {
      throw new NotFoundException(`Goal type with ID ${id} not found`);
    }

    return goalType;
  }

  update(id: number, updateGoalTypeDto: UpdateGoalTypeDto) {
    const db = this.databaseService.getDb();

    // Check if goal type exists
    this.findOne(id);

    const fields = [];
    const values = [];

    if (updateGoalTypeDto.name !== undefined) {
      fields.push('name = ?');
      values.push(updateGoalTypeDto.name);
    }
    if (updateGoalTypeDto.description !== undefined) {
      fields.push('description = ?');
      values.push(updateGoalTypeDto.description);
    }
    if (updateGoalTypeDto.color !== undefined) {
      fields.push('color = ?');
      values.push(updateGoalTypeDto.color);
    }
    if (updateGoalTypeDto.icon !== undefined) {
      fields.push('icon = ?');
      values.push(updateGoalTypeDto.icon);
    }

    if (fields.length === 0) {
      return this.findOne(id);
    }

    values.push(id);

    try {
      const stmt = db.prepare(`
        UPDATE goal_types SET ${fields.join(', ')} WHERE id = ?
      `);

      stmt.run(...values);
      return this.findOne(id);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException('Goal type with this name already exists');
      }
      throw error;
    }
  }

  remove(id: number) {
    const db = this.databaseService.getDb();

    // Check if goal type exists
    const goalType = this.findOne(id) as DbGoalType;

    // Check if goal type is being used
    if (goalType.goal_count > 0) {
      throw new ConflictException(
        `Cannot delete goal type that is used by ${goalType.goal_count} goal(s)`,
      );
    }

    const stmt = db.prepare('DELETE FROM goal_types WHERE id = ?');
    stmt.run(id);

    return { message: 'Goal type deleted successfully' };
  }
}
