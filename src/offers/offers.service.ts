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
    const wish = await this.wishesService.findOne({
      where: {
        id: createOfferDto.itemId,
      },
    });
    if (!wish) {
      throw new HttpException(
        'Нельзя скинуться на несуществующий подарок',
        404,
      );
    }

    const newOffer = await this.offerRepository.create({
      ...createOfferDto,
      user,
      item: wish,
    });
    await this.offerRepository.insert(newOffer);

    return newOffer;
  }

  async getAllOffers() {
    this.offerRepository.find({});
  }
}
