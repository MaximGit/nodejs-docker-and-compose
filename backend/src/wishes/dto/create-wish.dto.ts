import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateWishDto {
  @IsString()
  @MaxLength(250)
  name: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsUrl()
  @IsOptional()
  @IsUrl()
  image?: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsString()
  @MaxLength(1024)
  description: string;
}
