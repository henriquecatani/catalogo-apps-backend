import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDeveloperDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
