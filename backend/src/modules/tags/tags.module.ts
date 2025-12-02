import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  controllers: [TagsController],
  providers: [TagsService, DatabaseService],
})
export class TagsModule {}
