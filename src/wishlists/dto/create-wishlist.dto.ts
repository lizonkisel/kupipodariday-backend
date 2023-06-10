import {
  Length,
  Min,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Wish } from 'src/wishes/entities/wish.entity';

export class CreateWishlistDto {
  @IsNotEmpty()
  @Length(1, 250)
  name: string;

  @IsOptional()
  @Length(1, 1500)
  description: string;

  @IsNotEmpty()
  @IsUrl()
  image: string;

  @IsNotEmpty()
  // itemsId: Wish[];
  itemsId: number[];
}
