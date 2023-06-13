import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async findOne(query) {
    const wishlist = await this.wishlistRepository.findOne(query);
    return wishlist;
  }

  async findWish(query) {
    const wish = await this.wishesService.findOne(query);
    return wish;
  }

  async create(createWishlistDto: CreateWishlistDto, owner: User) {
    if (!createWishlistDto.description) {
      createWishlistDto.description = 'Просто вишлист';
    }

    const storedItems = await this.wishesService.findMany({
      where:
        { id: In(createWishlistDto.itemsId), owner: { id: owner.id } },
    });

    if (storedItems.length !== createWishlistDto.itemsId.length) {
      throw new HttpException(
        'Вы можете добавлять только существующие подарки',
        400,
      );
    }

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      items: storedItems,
      owner: owner,
    });
    return this.wishlistRepository.save(wishlist);
  }

  async getAllWishlists() {
    const allWishlists = await this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
    return allWishlists;
  }

  async getWishlistById(id) {
    const wishlist = await this.wishlistRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        owner: true,
        items: true,
      },
    });

    if (!wishlist) {
      throw new HttpException('Вишоиста с таким id не существует', 404);
    }

    return wishlist;
  }

  async updateWishlistById(updateWishlistDto, wishlistId, ownerId) {
    const wishlist = await this.wishlistRepository.findOneBy({ id: wishlistId });

    if (!wishlist) {
      throw new HttpException('Нельзя отредактировать несуществующий вишлист', 404);
    }

    const { itemsId, ...restUpdateWishlistDto } = updateWishlistDto;

    let storedItems;

    if (itemsId) {
      storedItems = await this.wishesService.findMany({
        where: { id: In(updateWishlistDto.itemsId), owner: { id: ownerId } },
      });

      if (storedItems.length !== updateWishlistDto.itemsId.length) {
        throw new HttpException(
          'Вы можете добавлять только существующие подарки',
          400,
        );
      }
    }

    const updatedWishlist = { ...wishlist, ...restUpdateWishlistDto };

    if (storedItems) {
      updatedWishlist.items = storedItems;
    }

    return this.wishlistRepository.save(updatedWishlist);
  }

  async deleteWishlist(id) {
    const deletedWishlist = await this.wishlistRepository.delete({ id });
    return deletedWishlist;
  }
}
