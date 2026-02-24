import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { Type } from "class-transformer";

export class UpdateGroupDto {
  @Type(() => Number)
  @IsInt()
  groupId: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
