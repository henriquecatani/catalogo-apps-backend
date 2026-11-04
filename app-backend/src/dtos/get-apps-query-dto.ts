import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class GetAppsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  developerId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(["free", "freemium", "paid"])
  pricing?: string;

  @IsOptional()
  @IsIn(["rating", "alphabetical", "newest"])
  sortBy?: "rating" | "alphabetical" | "newest" = "rating";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order?: "asc" | "desc";
}
