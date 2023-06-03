import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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
    return { access_token: this.jwtService.sign(payload) };
  }

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);

    /* В идеальном случае пароль обязательно должен быть захэширован */

    if (user) {
      /* Исключаем пароль из результата */
      const isHashValid = await bcrypt.compare(password, user.password);

      if (isHashValid) {
        const { password, ...result } = user;

        return user;
      } else {
        throw new HttpException(
          'Нет такого пользователя или пароль неверен',
          401,
        );
      }
    }

    return null;
  }
}
