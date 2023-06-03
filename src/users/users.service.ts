import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // async getMe(): Promise<UserProfileResponseDto> {
  //   // Добавить опции того, что надо тут найти
  //   const me = await this.userRepository.findOne();

  //   // Деструктурировать me, вернуть только нужные поля

  //   return "azaza"
  // }

  async findOne(query) {
    const user = await this.userRepository.findOne(query);
    return user;
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    return user;
    // return `This action returns a #${id} user`;
  }

  async create(createUserDto: CreateUserDto) {
    // const sameNameUser = await this.findOne(createUserDto.username);
    const sameNameUser = await this.findOne({
      where: {
        username: createUserDto.username
      },
    });
    if (sameNameUser) {
      throw new HttpException(
        'Пользователь с таким именем уже существует',
        409,
      );
    }

    const sameEmailUser = await this.findOne({
      where: {
        email: createUserDto.email,
      },
    });
    if (sameEmailUser) {
      throw new HttpException('Пользователь с таким email уже существует', 409);
    }

    const hash = await bcrypt.hash(createUserDto.password, 10);
    const { password, ...rest } = createUserDto;
    createUserDto.password = hash;
    const user = await this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });

    return user;
  }
}
