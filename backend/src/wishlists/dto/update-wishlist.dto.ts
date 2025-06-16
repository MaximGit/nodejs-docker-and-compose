import { IsString, IsOptional, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { Wish } from '../../wishes/entities/wish.entity';
import { User } from '../../users/entities/user.entity';

export class UpdateWishlistDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsArray()
  @Type(() => Wish)
  items: Wish[];

  @IsOptional()
  @Type(() => User)
  owner: User;
}
