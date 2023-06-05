import { IsUrl, IsEmail, Length } from 'class-validator';

export class UserProfileResponseDto {
  id: number;

  @Length(1, 64)
  username: string;

  @Length(1, 200)
  about: string;

  @IsUrl()
  avatar: string;

  @IsEmail()
  email: string;

  createdAt: Date;
  updatedAt: Date;
}
