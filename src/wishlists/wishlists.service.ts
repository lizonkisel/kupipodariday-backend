import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOneOptions } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from 'src/utils/errors/errors';
import { Wish } from 'src/wishes/entities/wish.entity';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  /* UTILS */

  async findOne(query: FindOneOptions<Wishlist>) {
    const wishlist = await this.wishlistRepository.findOne(query);
    return wishlist;
  }

  async findWish(query: FindOneOptions<Wish>) {
    const wish = await this.wishesService.findOne(query);
    return wish;
  }

  /* METHODS */

  async create(createWishlistDto: CreateWishlistDto, owner: User) {
    delete owner.password;
    delete owner.email;
    if (!createWishlistDto.description) {
      createWishlistDto.description = 'Просто вишлист';
    }

    const chosenItems = await this.wishesService.findMany({
      where: {
        id: In(createWishlistDto.itemsId),
        owner: { id: owner.id },
      },
    });

    if (chosenItems.length !== createWishlistDto.itemsId.length) {
      throw new BadRequestException(
        'Вы можете добавлять только существующие подарки',
      );
    }

    const wishlist = this.wishlistRepository.create({
      ...createWishlistDto,
      items: chosenItems,
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

    allWishlists.map((wishlist) => {
      delete wishlist.owner.password;
      delete wishlist.owner.email;
      return wishlist;
    });

    return allWishlists;
  }

  async getWishlistById(id: number) {
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

    delete wishlist.owner.password;
    delete wishlist.owner.email;

    return wishlist;
  }

  async updateWishlistById(
    updateWishlistDto: UpdateWishlistDto,
    wishlistId: number,
    ownerId: number,
  ) {
    const wishlist = await this.wishlistRepository.findOne({
      where: {
        id: wishlistId,
      },
      relations: {
        owner: true,
      },
    });

    if (!wishlist) {
      throw new NotFoundException(
        'Нельзя отредактировать несуществующий вишлист',
      );
    }

    if (wishlist.owner.id !== ownerId) {
      throw new ForbiddenException(
        'Нельзя отредактировать вишлист другого пользователя',
      );
    }

    const { itemsId, ...restUpdateWishlistDto } = updateWishlistDto;

    let chosenItems: Wish[];

    if (itemsId) {
      chosenItems = await this.wishesService.findMany({
        where: {
          id: In(updateWishlistDto.itemsId),
          owner: { id: ownerId },
        },
      });

      if (chosenItems.length !== updateWishlistDto.itemsId.length) {
        throw new BadRequestException(
          'Вы можете добавлять только существующие подарки',
        );
      }
    }

    const updatedWishlist = { ...wishlist, ...restUpdateWishlistDto };

    if (chosenItems) {
      updatedWishlist.items = chosenItems;
    }

    delete updatedWishlist.owner.password;
    delete updatedWishlist.owner.email;

    return this.wishlistRepository.save(updatedWishlist);
  }

  async deleteWishlist(wishlistId: number, currentUserId: number) {
    const deletableWishlist = await this.findOne({
      where: {
        id: wishlistId,
      },
      relations: {
        owner: true,
      },
    });

    if (!deletableWishlist) {
      throw new NotFoundException('Вишлист с таким id не найден');
    }

    if (deletableWishlist.owner.id !== currentUserId) {
      throw new ForbiddenException(
        'Нельзя удалить вишлист другого пользователя',
      );
    }

    const deletedWishlist = await this.wishlistRepository.delete({
      id: wishlistId,
    });

    return deletedWishlist;
  }
}
