import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsIn } from 'class-validator';

export class UpdateGoalDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  goal_type_id?: number;

  @IsString()
  @IsIn(['active', 'completed', 'on_hold', 'archived'])
  @IsOptional()
  status?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;

  @IsDateString()
  @IsOptional()
  target_date?: string;

  @IsString()
  @IsIn(['Q1', 'Q2', 'Q3', 'Q4'])
  @IsOptional()
  quarter?: string;

  @IsInt()
  @IsOptional()
  year?: number;
}
