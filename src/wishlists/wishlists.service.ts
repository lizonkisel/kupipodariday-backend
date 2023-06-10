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

  async getAllWishlists() {
    const allWishlists = await this.wishlistRepository.find({
      relations: {
        owner: true,
        items: true,
      },
    });
    return allWishlists;
  }

  async findOne(query) {
    const wishlist = await this.wishlistRepository.findOne(query);
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
          'Вы можете добавлять только существующие подарки', 400,
        );
      }

      // await this.wishlistRepository.save({id: wishlistId}, {
      //   ...restUpdateWishlistDto,
      //   items: storedItems,
      // });
      // await this.wishlistRepository.update({id: wishlistId}, {
      //   ...restUpdateWishlistDto,
      //   items: storedItems,
      // });
    }
    // else {
    //   await this.wishlistRepository.update(wishlistId, updateWishlistDto);
    // }

    const updatedWishlist = { ...wishlist, ...restUpdateWishlistDto };

    if (storedItems) {
      updatedWishlist.items = storedItems;
    }

    return this.wishlistRepository.save(updatedWishlist);

    // const updatedWishlist = await this.wishlistRepository.findOneBy({ id: wishlistId });
    // return updatedWishlist;
  }

  async deleteWishlist(id) {
    const deletedWishlist = await this.wishlistRepository.delete({ id });
    return deletedWishlist;
  }
}
