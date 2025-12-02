import { Module } from '@nestjs/common';
import { GoalTypesService } from './goal-types.service';
import { GoalTypesController } from './goal-types.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  controllers: [GoalTypesController],
  providers: [GoalTypesService, DatabaseService],
  exports: [GoalTypesService],
})
export class GoalTypesModule {}
