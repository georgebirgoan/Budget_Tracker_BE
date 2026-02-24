import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";

export class AddPriorityInGroupDto {
  @Type(() => Number)        // 
  @IsInt()
  groupId: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
