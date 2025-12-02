import { Controller, Get, Put, Body, Query } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('api/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('database-path')
  getDatabasePath() {
    return this.configService.getDatabasePath();
  }

  @Put('database-path')
  updateDatabasePath(@Body('path') path: string) {
    return this.configService.updateDatabasePath(path);
  }

  @Get('browse-directory')
  browseDirectory(@Query('path') path?: string) {
    return this.configService.browseDirectory(path);
  }
}
