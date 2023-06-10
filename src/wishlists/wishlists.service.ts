import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, owner: User) {
    if (!createWishlistDto.description) {
      createWishlistDto.description = 'Просто вишлист';
    }

    const storedItems = await this.wishesService.findMany({
      where: { id: In(createWishlistDto.itemsId), owner: { id: owner.id } },
    });

    if (storedItems.length !== createWishlistDto.itemsId.length) {
      throw new HttpException(
        'Вы можете добавлять только существующие подарки', 400,
      );
    }

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      items: storedItems,
      owner: owner,
    });
    return this.wishlistRepository.save(wishlist);
  }

  async findWish(query) {
    const wish = await this.wishesService.findOne(query);
    return wish;
  }

  async deleteWishlist(id) {
    const deletedWishlist = await this.wishlistRepository.delete({ id });
    return deletedWishlist;
  }
}
