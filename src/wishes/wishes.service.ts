import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, owner: User) {
    const newWish = await this.wishRepository.create({
      ...createWishDto,
      owner,
    });

    await this.wishRepository.insert(newWish);
    return newWish;
  }

  async findOne(query) {
    const wish = await this.wishRepository.findOne(query);
    return wish;
  }
}
