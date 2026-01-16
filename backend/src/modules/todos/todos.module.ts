import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  controllers: [TodosController],
  providers: [TodosService, DatabaseService],
  exports: [TodosService],
})
export class TodosModule {}
