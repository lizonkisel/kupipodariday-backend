import { Length, IsUrl, IsOptional } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateWishlistDto } from './create-wishlist.dto';

export class UpdateWishlistDto extends PartialType(CreateWishlistDto) {
  @IsOptional()
  @Length(1, 250)
  name?: string;

  @IsOptional()
  @Length(1, 1500)
  description?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  itemsId?: number[];
}
