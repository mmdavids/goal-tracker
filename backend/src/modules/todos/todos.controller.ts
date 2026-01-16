import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('api/todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todosService.create(createTodoDto);
  }

  @Get()
  findAll(
    @Query('goal_id') goalId?: string,
    @Query('status') status?: string,
    @Query('has_goal') hasGoal?: string,
    @Query('is_completed') isCompleted?: string,
  ) {
    const filters = {
      goalId: goalId ? parseInt(goalId, 10) : undefined,
      status: status || undefined,
      hasGoal: hasGoal !== undefined ? hasGoal === 'true' : undefined,
      isCompleted: isCompleted !== undefined ? isCompleted === 'true' : undefined,
    };

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined)
    );

    return this.todosService.findAll(Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.remove(id);
  }

  @Patch(':id/toggle')
  toggleComplete(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.toggleComplete(id);
  }

  @Delete()
  deleteAll() {
    return this.todosService.deleteAll();
  }
}
