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
import { ProgressUpdateTypesService } from './progress-update-types.service';
import { CreateProgressUpdateTypeDto } from './dto/create-progress-update-type.dto';
import { UpdateProgressUpdateTypeDto } from './dto/update-progress-update-type.dto';

@Controller('api/progress-update-types')
export class ProgressUpdateTypesController {
  constructor(private readonly progressUpdateTypesService: ProgressUpdateTypesService) {}

  @Post()
  create(@Body() createProgressUpdateTypeDto: CreateProgressUpdateTypeDto) {
    return this.progressUpdateTypesService.create(createProgressUpdateTypeDto);
  }

  @Get()
  findAll() {
    return this.progressUpdateTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.progressUpdateTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgressUpdateTypeDto: UpdateProgressUpdateTypeDto,
  ) {
    return this.progressUpdateTypesService.update(id, updateProgressUpdateTypeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.progressUpdateTypesService.remove(id);
  }
}
