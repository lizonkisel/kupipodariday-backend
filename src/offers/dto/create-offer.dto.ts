import {
  Length,
  Min,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Wish } from 'src/wishes/entities/wish.entity';

export class CreateOfferDto {
  @IsNotEmpty()
  // item: Wish;
  itemId: number;

  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  hidden: boolean;
}
