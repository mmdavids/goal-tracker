import { IsString, IsOptional } from 'class-validator';

export class CreateProgressUpdateTypeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  emoji?: string;
}
