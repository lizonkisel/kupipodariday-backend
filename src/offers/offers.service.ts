import { HttpException, Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Offer } from './entities/offer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOneOptions, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { ForbiddenException, NotFoundException } from 'src/utils/errors/errors';

@Injectable()
export class OffersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  /* UTILS */

  async findOne(query: FindOneOptions<Offer>) {
    const offer = await this.offerRepository.findOne(query);
    return offer;
  }

  /* METHODS */

  async createOffer(createOfferDto: CreateOfferDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    const { amount, itemId, hidden } = createOfferDto;

    const wish = await this.wishesService.findOne({
      where: {
        id: itemId,
      },
      relations: {
        owner: true,
      },
    });
    if (!wish) {
      throw new NotFoundException('Нельзя скинуться на несуществующий подарок');
    }

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('Нельзя скинуться на собственный подарок');
    }

    if (wish.raised >= wish.price) {
      throw new ForbiddenException('Вся сумма на подарок уже собрана');
    }

    if (wish.price - wish.raised < amount) {
      throw new ForbiddenException(
        'Сумма вашего вклада превышает недостающую стоимость подарка',
      );
    }

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const updatedWish = await this.wishesService.updateRaisedField(
        wish,
        amount,
      );

      let finalOfferDto;
      if (hidden) {
        finalOfferDto = {
          amount,
          item: updatedWish,
          hidden,
        };
      } else {
        finalOfferDto = {
          amount,
          item: updatedWish,
          user: user,
          hidden,
        };
        delete finalOfferDto.user.password;
        delete finalOfferDto.user.email;
      }

      const newOffer = await this.offerRepository.create({
        ...finalOfferDto,
      });

      await this.offerRepository.insert(newOffer);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new HttpException('Возникла непредвиденная ошибка', 400);
    } finally {
      await queryRunner.release();
    }
  }

  async getAllOffers() {
    const allOffers = await this.offerRepository.find({
      relations: {
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
    });

    allOffers.map((offer) => {
      delete offer.item.owner.password;
      delete offer.item.owner.email;
      return offer;
    });

    return allOffers;
  }

  async getOfferById(id: number) {
    const offer = await this.offerRepository.findOne({
      where: {
        id: id,
      },
      relations: {
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
    });

    if (!offer) {
      throw new NotFoundException('Нет оффера с таким id');
    }

    delete offer.item.owner.password;
    delete offer.item.owner.email;

    delete offer.user.password;
    delete offer.user.email;

    return offer;
  }
}
