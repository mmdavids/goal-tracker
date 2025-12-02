import { Module } from '@nestjs/common';
import { GoalsModule } from './modules/goals/goals.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ImagesModule } from './modules/images/images.module';
import { TagsModule } from './modules/tags/tags.module';
import { GoalTypesModule } from './modules/goal-types/goal-types.module';
import { DatabaseService } from './database/database.service';

@Module({
  imports: [GoalsModule, ProgressModule, ImagesModule, TagsModule, GoalTypesModule],
  providers: [DatabaseService],
})
export class AppModule {}
