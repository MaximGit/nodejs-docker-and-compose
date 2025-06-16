import {
  IsString,
  IsOptional,
  IsUrl,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class UpdateWishDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  name?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsUrl()
  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  description?: string;
}
