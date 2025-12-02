import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { DatabaseService } from '../../database/database.service';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, DatabaseService],
})
export class ImagesModule {}
