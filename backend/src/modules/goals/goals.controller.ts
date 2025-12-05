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
  Logger,
  Header,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Controller('api/goals')
export class GoalsController {
  private readonly logger = new Logger(GoalsController.name);

  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Body() createGoalDto: CreateGoalDto) {
    try {
      this.logger.log(`POST /api/goals - Request body: ${JSON.stringify(createGoalDto)}`);
      const result = this.goalsService.create(createGoalDto);
      this.logger.log(`POST /api/goals - Success: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`POST /api/goals - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.goalsService.findAll(status);
  }

  @Get('stats')
  getStats() {
    return this.goalsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, updateGoalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.remove(id);
  }

  @Get('trash/all')
  findDeleted() {
    return this.goalsService.findDeleted();
  }

  @Patch(':id/restore')
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.restore(id);
  }

  @Delete(':id/permanent')
  permanentDelete(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.permanentDelete(id);
  }

  @Patch(':id/archive')
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.goalsService.archive(id);
  }

  @Post('export')
  @Header('Content-Type', 'text/markdown')
  async exportToMarkdown(@Body('goalIds') goalIds: number[], @Res() res: Response) {
    const markdown = await this.goalsService.exportToMarkdown(goalIds);
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `goals-export-${timestamp}.md`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(markdown);
  }

  @Post('export-zip')
  @Header('Content-Type', 'application/zip')
  async exportToZip(@Body('goalIds') goalIds: number[], @Res() res: Response) {
    const zipStream = await this.goalsService.exportToZip(goalIds);
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `goals-export-${timestamp}.zip`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    zipStream.pipe(res);
  }
}
