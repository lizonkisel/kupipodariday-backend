import { PartialType } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';
import { Length, IsUrl, Min, IsOptional } from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @Length(1, 250)
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @Min(1)
  @IsOptional()
  price?: number;

  @Length(1, 1024)
  @IsOptional()
  description?: string;
}
