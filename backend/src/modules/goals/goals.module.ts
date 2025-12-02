import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  controllers: [GoalsController],
  providers: [GoalsService, DatabaseService],
  exports: [GoalsService],
})
export class GoalsModule {}
