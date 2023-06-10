import { Controller, UseGuards, Post, Get, Body, Req, Param } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtGuard } from 'src/guards/jwt-guard';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req) {
    return this.offersService.createOffer(createOfferDto, req.user);
  }

  @Get()
  getAllOffers() {
    return this.offersService.getAllOffers();
  }

  @Get(':id')
  getOfferById(@Param('id') id: string) {
    return this.offersService.findOne({
      where: {
        id: id,
      },
      relations: {
        item: {
          owner: true,
          offers: true,
        },
        user: true,
        // wishlists: true,
      },
    });
  }
}
