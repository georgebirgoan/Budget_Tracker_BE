// dto/add-priority.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AddGroupDto {
  @IsString()
  @IsNotEmpty()
  monthKey: string;

  @IsString()
  @IsNotEmpty()
  name: string;


}
