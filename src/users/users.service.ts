import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /* UTILS */

  async findOne(query) {
    const user = await this.userRepository.findOne(query);
    return user;
  }

  async findOneById(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  deletePassword = (user) => {
    delete user.password;
    return user;
  };

  /* METHODS */

  async getMe(myId) {
    let me = await this.findOneById(myId);
    me = this.deletePassword(me);
    return me;
  }

  async createUser(createUserDto: CreateUserDto) {
    const sameNameUser = await this.findOne({
      where: {
        username: createUserDto.username,
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
    await this.userRepository.save(user);

    const userWithoutPassword = this.deletePassword(user);
    return userWithoutPassword;
  }

  async updateUser(updateUserDto, currentUserId) {
    const user = await this.findOneById(currentUserId);

    if (!user) {
      throw new HttpException('Такого пользователя не существует', 404);
    }

    if (updateUserDto.password) {
      const hash = await bcrypt.hash(updateUserDto.password, 10);
      updateUserDto.password = hash;
    }

    await this.userRepository.update(currentUserId, updateUserDto);

    const updatedUser = await this.findOneById(currentUserId);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async getMyWishes(currentUserId) {
    const user = await this.findOne({
      where: { id: currentUserId },
      relations: {
        wishes: {
          owner: true,
          offers: {
            user: {
              wishes: true,
              offers: true,
              wishlists: {
                owner: true,
                items: true,
              },
            },
          },
        },
      },
    });

    const wishes = user.wishes;

    return wishes;
  }

  async getUserByUsername(username: string) {
    let user = await this.findOne({
      where: { username: username },
    });

    user = this.deletePassword(user);
    delete user.email;

    return user;
  }

  async getWishesByUsername(username: string) {
    const user = await this.findOne({
      where: {
        username: username,
      },
      relations: {
        wishes: {
          offers: {
            item: {
              owner: true,
              offers: true,
            },
            user: {
              wishes: {
                owner: true,
                offers: true,
              },
              offers: true,
              wishlists: {
                owner: true,
                items: true,
              },
            },
          },
        },
      },
    });

    return user.wishes;
  }

  async findUsers(query) {
    const name = query.query;
    const users = await this.userRepository.find({
      where: [{ username: Like(`%${name}%`) }, { email: Like(`%${name}%`) }],
    });

    if (!users) {
      throw new HttpException('Нет пользователей с такими данными', 404);
    }

    return users;
  }
}
