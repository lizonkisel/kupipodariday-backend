import { HttpException, Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async createOffer(createOfferDto: CreateOfferDto, user: User) {
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
      throw new HttpException(
        'Нельзя скинуться на несуществующий подарок',
        404,
      );
    }

    if (wish.owner.id === user.id) {
      throw new HttpException('Нельзя скинуться на собственный подарок', 403);
    }

    if (wish.raised >= wish.price) {
      throw new HttpException('Вся сумма на подарок уже собрана', 403);
    }

    if ((wish.price - wish.raised) < amount) {
      throw new HttpException(
        'Сумма вашего вклада превышает недостающую стоимость подарка',
        403,
      );
    }

    const updatedWish = await this.wishesService.updateRaisedField(wish, amount);

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
    }

    const newOffer = await this.offerRepository.create({
      ...finalOfferDto,
    });
    await this.offerRepository.insert(newOffer);

    return newOffer;
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
    return allOffers;
  }

  async getOfferById(id) {
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
      throw new HttpException('Нет оффера с таким id', 404);
    }

    return offer;
  }

  async findOne(query) {
    const offer = await this.offerRepository.findOne(query);
    return offer;
  }
}
