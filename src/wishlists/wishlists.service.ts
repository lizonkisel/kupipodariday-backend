import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOneOptions } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { BadRequestException, NotFoundException } from 'src/utils/errors/errors';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async findOne(query: FindOneOptions<Wishlist>) {
    const wishlist = await this.wishlistRepository.findOne(query);
    return wishlist;
  }

  async findWish(query: FindOneOptions<Wish>) {
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
      throw new BadRequestException(
        'Вы можете добавлять только существующие подарки',
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
      throw new NotFoundException('Вишлиста с таким id не существует');
    }

    return wishlist;
  }

  async updateWishlistById(
    updateWishlistDto: UpdateWishlistDto,
    wishlistId,
    ownerId,
  ) {
    const wishlist = await this.wishlistRepository.findOneBy({ id: wishlistId });

    if (!wishlist) {
      throw new NotFoundException('Нельзя отредактировать несуществующий вишлист');
    }

    const { itemsId, ...restUpdateWishlistDto } = updateWishlistDto;

    let storedItems;

    if (itemsId) {
      storedItems = await this.wishesService.findMany({
        where: { id: In(updateWishlistDto.itemsId), owner: { id: ownerId } },
      });

      if (storedItems.length !== updateWishlistDto.itemsId.length) {
        throw new BadRequestException(
          'Вы можете добавлять только существующие подарки',
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
