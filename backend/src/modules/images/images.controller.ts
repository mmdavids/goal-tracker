import {
  Controller,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Body,
  Get,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ImagesService } from './images.service';

@Controller('api')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('progress/:id/images')
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadImages(
    @Param('id', ParseIntPipe) progressUpdateId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('captions') captions?: string | string[],
  ) {
    const captionsArray = Array.isArray(captions)
      ? captions
      : captions
        ? [captions]
        : [];

    return this.imagesService.create(progressUpdateId, files, captionsArray);
  }

  @Get('images/:filename')
  getImage(@Param('filename') filename: string, @Res() res: Response) {
    const image = this.imagesService.getImage(filename, 'original');
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    return res.send(image.data);
  }

  @Get('images/:filename/thumbnail')
  getThumbnail(@Param('filename') filename: string, @Res() res: Response) {
    const image = this.imagesService.getImage(filename, 'thumbnail');
    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    return res.send(image.data);
  }

  @Delete('images/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.remove(id);
  }
}
