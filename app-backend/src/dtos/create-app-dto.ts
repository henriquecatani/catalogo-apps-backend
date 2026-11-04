import { IsIn, IsInt, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateAppDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  link: string;

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
