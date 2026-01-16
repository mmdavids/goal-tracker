import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { DbTodo } from '../../database/database.types';

@Injectable()
export class TodosService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createTodoDto: CreateTodoDto) {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      INSERT INTO todos (title, description, goal_id, priority, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      createTodoDto.title,
      createTodoDto.description || null,
      createTodoDto.goal_id || null,
      createTodoDto.priority || 'medium',
      createTodoDto.due_date || null,
      createTodoDto.status || 'pending',
    );

    return this.findOne(result.lastInsertRowid as number);
  }

  findAll(filters?: {
    goalId?: number;
    status?: string;
    hasGoal?: boolean;
    isCompleted?: boolean;
  }) {
    const db = this.databaseService.getDb();
    let query = `
      SELECT t.*,
        g.title as goal_title,
        g.emoji as goal_icon,
        gt.color as goal_color
      FROM todos t
      LEFT JOIN goals g ON t.goal_id = g.id
      LEFT JOIN goal_types gt ON g.goal_type_id = gt.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.goalId !== undefined) {
      query += ` AND t.goal_id = ?`;
      params.push(filters.goalId);
    }

    if (filters?.status) {
      query += ` AND t.status = ?`;
      params.push(filters.status);
    }

    if (filters?.hasGoal !== undefined) {
      if (filters.hasGoal) {
        query += ` AND t.goal_id IS NOT NULL`;
      } else {
        query += ` AND t.goal_id IS NULL`;
      }
    }

    if (filters?.isCompleted !== undefined) {
      if (filters.isCompleted) {
        query += ` AND t.completed_at IS NOT NULL`;
      } else {
        query += ` AND t.completed_at IS NULL`;
      }
    }

    query += ` ORDER BY
      CASE t.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
        ELSE 4
      END,
      CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
      t.due_date ASC,
      t.created_at DESC
    `;

    const stmt = db.prepare(query);
    return params.length > 0 ? stmt.all(...params) : stmt.all();
  }

  findOne(id: number) {
    const db = this.databaseService.getDb();
    const stmt = db.prepare(`
      SELECT t.*,
        g.title as goal_title,
        g.emoji as goal_icon,
        gt.color as goal_color
      FROM todos t
      LEFT JOIN goals g ON t.goal_id = g.id
      LEFT JOIN goal_types gt ON g.goal_type_id = gt.id
      WHERE t.id = ?
    `);

    const todo = stmt.get(id) as DbTodo | undefined;
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    return todo;
  }

  update(id: number, updateTodoDto: UpdateTodoDto) {
    const db = this.databaseService.getDb();

    // Check if todo exists
    this.findOne(id);

    const fields = [];
    const values = [];

    if (updateTodoDto.title !== undefined) {
      fields.push('title = ?');
      values.push(updateTodoDto.title);
    }
    if (updateTodoDto.description !== undefined) {
      fields.push('description = ?');
      values.push(updateTodoDto.description);
    }
    if (updateTodoDto.goal_id !== undefined) {
      fields.push('goal_id = ?');
      values.push(updateTodoDto.goal_id);
    }
    if (updateTodoDto.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updateTodoDto.priority);
    }
    if (updateTodoDto.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updateTodoDto.due_date);
    }
    if (updateTodoDto.status !== undefined) {
      fields.push('status = ?');
      values.push(updateTodoDto.status);

      if (updateTodoDto.status === 'completed') {
        fields.push('completed_at = CURRENT_TIMESTAMP');
      } else if (updateTodoDto.status === 'pending' || updateTodoDto.status === 'in_progress') {
        fields.push('completed_at = NULL');
      }
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE todos SET ${fields.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);
    return this.findOne(id);
  }

  remove(id: number) {
    const db = this.databaseService.getDb();

    // Check if todo exists
    this.findOne(id);

    const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
    stmt.run(id);

    return { message: 'Todo deleted successfully' };
  }

  toggleComplete(id: number) {
    const todo = this.findOne(id);
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

    return this.update(id, { status: newStatus });
  }

  deleteAll() {
    const db = this.databaseService.getDb();

    const countStmt = db.prepare('SELECT COUNT(*) as count FROM todos');
    const result = countStmt.get() as { count: number };
    const count = result.count;

    const stmt = db.prepare('DELETE FROM todos');
    stmt.run();

    return { message: `Deleted ${count} todo(s) successfully`, count };
  }
}
