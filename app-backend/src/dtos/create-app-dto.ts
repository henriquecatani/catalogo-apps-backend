import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateAppDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  smallDescription: string;

  @IsString()
  @IsNotEmpty()
  markdownDescription: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["free", "foss", "freemium", "paid"], {
    message: "pricing must be one of: free, foss, freemium, paid",
  })
  pricing: string;

  @IsInt()
  developerId: number;
}
