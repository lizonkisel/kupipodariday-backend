import {
  Length,
  Min,
  IsUrl,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class CreateWishDto {
  @Length(1, 250)
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  link: string;

  @IsUrl()
  @IsNotEmpty()
  image: string;

  @Min(1)
  @IsNotEmpty()
  price: number;

  @Length(1, 1024)
  @IsOptional()
  description: string;
}
