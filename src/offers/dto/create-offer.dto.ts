import { Min, IsNotEmpty } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  itemId: number;

  @IsNotEmpty()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  hidden: boolean;
}
