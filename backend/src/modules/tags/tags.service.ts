import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createTagDto: CreateTagDto) {
    const db = this.databaseService.getDb();

    try {
      const stmt = db.prepare(`
        INSERT INTO tags (name, color)
        VALUES (?, ?)
      `);

      const result = stmt.run(
        createTagDto.name,
        createTagDto.color || '#3b82f6',
      );

      return this.findOne(result.lastInsertRowid as number);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException('Tag with this name already exists');
      }
      throw error;
    }
  }

  findAll() {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT t.*, COUNT(gt.goal_id) as goal_count
      FROM tags t
      LEFT JOIN goal_tags gt ON t.id = gt.tag_id
      GROUP BY t.id
      ORDER BY t.name
    `);
    return stmt.all();
  }

  findOne(id: number) {
    const db = this.databaseService.getDb();
    const stmt = db.prepare('SELECT * FROM tags WHERE id = ?');
    const tag = stmt.get(id);

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  addTagToGoal(goalId: number, tagId: number) {
    const db = this.databaseService.getDb();

    // Check if goal exists
    const goalStmt = db.prepare('SELECT * FROM goals WHERE id = ?');
    if (!goalStmt.get(goalId)) {
      throw new NotFoundException(`Goal with ID ${goalId} not found`);
    }

    // Check if tag exists
    this.findOne(tagId);

    try {
      const stmt = db.prepare(`
        INSERT INTO goal_tags (goal_id, tag_id) VALUES (?, ?)
      `);
      stmt.run(goalId, tagId);

      return { message: 'Tag added to goal successfully' };
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new ConflictException('Tag already added to this goal');
      }
      throw error;
    }
  }

  removeTagFromGoal(goalId: number, tagId: number) {
    const db = this.databaseService.getDb();

    const stmt = db.prepare(`
      DELETE FROM goal_tags WHERE goal_id = ? AND tag_id = ?
    `);

    const result = stmt.run(goalId, tagId);

    if (result.changes === 0) {
      throw new NotFoundException('Tag not found on this goal');
    }

    return { message: 'Tag removed from goal successfully' };
  }

  remove(id: number) {
    const db = this.databaseService.getDb();

    // Check if tag exists
    this.findOne(id);

    const stmt = db.prepare('DELETE FROM tags WHERE id = ?');
    stmt.run(id);

    return { message: 'Tag deleted successfully' };
  }
}
