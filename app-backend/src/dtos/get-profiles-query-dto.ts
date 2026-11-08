import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class GetProfilesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;
}
