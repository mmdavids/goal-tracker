import { IsString, IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress_delta?: number;

  @IsDateString()
  @IsOptional()
  date_achieved?: string;
}
