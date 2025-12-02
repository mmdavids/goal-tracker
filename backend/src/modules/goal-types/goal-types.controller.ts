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
import { GoalTypesService } from './goal-types.service';
import { CreateGoalTypeDto } from './dto/create-goal-type.dto';
import { UpdateGoalTypeDto } from './dto/update-goal-type.dto';

@Controller('api/goal-types')
export class GoalTypesController {
  constructor(private readonly goalTypesService: GoalTypesService) {}

  @Post()
  create(@Body() createGoalTypeDto: CreateGoalTypeDto) {
    return this.goalTypesService.create(createGoalTypeDto);
  }

  @Get()
  findAll() {
    return this.goalTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoalTypeDto: UpdateGoalTypeDto,
  ) {
    return this.goalTypesService.update(id, updateGoalTypeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalTypesService.remove(id);
  }
}
