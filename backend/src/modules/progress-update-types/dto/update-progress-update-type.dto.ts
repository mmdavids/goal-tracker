import { PartialType } from '@nestjs/mapped-types';
import { CreateProgressUpdateTypeDto } from './create-progress-update-type.dto';

export class UpdateProgressUpdateTypeDto extends PartialType(
  CreateProgressUpdateTypeDto,
) {}
