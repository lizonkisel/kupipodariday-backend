import { HttpException, Injectable } from '@nestjs/common';
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

  async findMany(query) {
    const wishes = await this.wishRepository.find(query);
    return wishes;
  }

  async deleteWishById(id) {
    const wish = await this.findOne({
      where: { id: id },
    });
    if (!wish) {
      throw new HttpException('Желания с таким id не существует', 404);
    }
    await this.deleteOne(id);
    return wish;
  }

  async deleteOne(id) {
    const deletedWish = await this.wishRepository.delete({ id });
    return deletedWish;
  }
}
