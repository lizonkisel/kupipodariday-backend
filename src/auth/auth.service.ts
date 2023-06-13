import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from 'src/errors/errors';

import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  auth(user: User) {
    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOne({
      where: { username: username }
    });

    if (user) {
      const isHashValid = await bcrypt.compare(password, user.password);

      if (isHashValid) {
        const { password, ...result } = user;

        return user;
      } else {
        throw new UnauthorizedException(
          'Нет такого пользователя или пароль неверен',
        );
      }
    }

    return null;
  }
}
