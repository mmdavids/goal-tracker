import { IsString, IsOptional, IsInt, IsDateString, IsIn } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  goal_id?: number | null;

  @IsString()
  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;

  @IsString()
  @IsIn(['pending', 'in_progress', 'completed'])
  @IsOptional()
  status?: string;
}
