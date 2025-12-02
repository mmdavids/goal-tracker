import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller('api')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('goals/:goalId/progress')
  create(
    @Param('goalId', ParseIntPipe) goalId: number,
    @Body() createProgressDto: CreateProgressDto,
  ) {
    return this.progressService.create(goalId, createProgressDto);
  }

  @Get('goals/:goalId/progress')
  findAllByGoal(@Param('goalId', ParseIntPipe) goalId: number) {
    return this.progressService.findAllByGoal(goalId);
  }

  @Get('progress/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.progressService.findOne(id);
  }

  @Patch('progress/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.progressService.update(id, updateProgressDto);
  }

  @Patch('progress/:id/move')
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body('goalId') goalId: number,
  ) {
    return this.progressService.moveToGoal(id, goalId);
  }

  @Delete('progress/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.progressService.remove(id);
  }
}
