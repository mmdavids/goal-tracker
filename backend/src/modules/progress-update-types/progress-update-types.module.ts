import { Module } from '@nestjs/common';
import { ProgressUpdateTypesService } from './progress-update-types.service';
import { ProgressUpdateTypesController } from './progress-update-types.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  controllers: [ProgressUpdateTypesController],
  providers: [ProgressUpdateTypesService, DatabaseService],
  exports: [ProgressUpdateTypesService],
})
export class ProgressUpdateTypesModule {}
