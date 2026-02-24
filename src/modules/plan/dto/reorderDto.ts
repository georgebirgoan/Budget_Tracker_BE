import { ArrayNotEmpty, IsArray, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class ReorderGroupsDto {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  groupIds: number[];
}
