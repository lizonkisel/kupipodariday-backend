import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { Wish } from './entities/wish.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { ForbiddenException, NotFoundException } from 'src/utils/errors/errors';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly usersService: UsersService,
  ) {}

  /* UTILS */

  async findOne(query: FindOneOptions<Wish>) {
    const wish = await this.wishRepository.findOne(query);
    return wish;
  }

  async findMany(query: FindManyOptions<Wish>) {
    const wishes = await this.wishRepository.find(query);
    return wishes;
  }

  async deleteOne(id) {
    const deletedWish = await this.wishRepository.delete({ id });
    return deletedWish;
  }

  /* METHODS */

  async create(createWishDto: CreateWishDto, owner: User) {
    const newWish = await this.wishRepository.create({
      ...createWishDto,
      owner,
    });

    await this.wishRepository.insert(newWish);
    return newWish;
  }

  async getWishById(id) {
    const wish = this.findOne({
      where: {
        id: id,
      },
      relations: {
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
    });

    if (!wish) {
      throw new NotFoundException('Желания с таким id не существует');
    }

    return wish;
  }

  async updateWish(wishId, currentUserId, updateWishDto: UpdateWishDto) {
    const wish = await this.findOne({
      where: {
        id: wishId,
      },
      relations: {
        owner: true,
        offers: true,
      },
    });

    if (!wish) {
      throw new NotFoundException('Такого подарка не сущетсвует');
    }

    if (wish.owner.id !== currentUserId) {
      throw new ForbiddenException(
        'Вы не можете редактировать подарок другого пользователя',
      );
    }

    if (wish.offers.length !== 0 && wish.raised !== 0) {
      throw new ForbiddenException(
        'Вы не можете редактировать подарок, на который уже скинулись',
      );
    }

    const updatedWish = await this.wishRepository.update(wishId, updateWishDto);
    return updatedWish;
  }

  async deleteWishById(wishId, currentUserId) {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: {
        owner: true,
        offers: true,
      },
    });
    if (!wish) {
      throw new NotFoundException('Желания с таким id не существует');
    }

    if (wish.owner.id !== currentUserId) {
      throw new ForbiddenException(
        'Вы не можете удалить подарок другого пользователя',
      );
    }

    if (wish.offers.length !== 0 && wish.raised !== 0) {
      throw new ForbiddenException(
        'Вы не можете удалить подарок, на который уже скинулись',
      );
    }

    await this.deleteOne(wishId);
    return wish;
  }

  async copyWish(wishId, currentUserId) {
    const originalWish = await this.findOne({
      where: {
        id: wishId,
      },
      relations: {
        owner: true,
      },
    });

    if (!originalWish) {
      throw new NotFoundException('Желания с таким id не существует');
    }

    const wishOwnerId = originalWish.owner.id;

    if (wishOwnerId === currentUserId) {
      throw new ForbiddenException(
        'Нельзя копировать своё собственное желание',
      );
    }

    const newOwner = await this.usersService.findOne({
      where: {
        id: currentUserId,
      },
    });

    const newWishDto = {
      name: originalWish.name,
      link: originalWish.link,
      image: originalWish.image,
      price: originalWish.price,
      description: originalWish.description,
    };

    const newWish = await this.create(newWishDto, newOwner);

    const { copied, ...restWishFields } = originalWish;

    const updCopied = copied + 1;

    await this.wishRepository.update(wishId, {
      ...restWishFields,
      copied: updCopied,
    });

    return newWish;
  }

  async updateRaisedField(wish: Wish, amount: number) {
    const newRaised = wish.raised + amount;
    const newWish = await this.wishRepository.save({
      ...wish,
      raised: newRaised,
    });
    console.log(newWish);
    return newWish;
  }

  async getLast() {
    const lastWishes = await this.findMany({
      relations: {
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
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });

    return lastWishes;
  }

  async getTop() {
    const topWishes = await this.findMany({
      relations: {
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
      order: {
        copied: 'DESC',
      },
      take: 20,
    });

    return topWishes;
  }
}
