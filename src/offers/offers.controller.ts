import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { JwtGuard } from 'src/guards/jwt-guard';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  // @Post()
  // create(@Body() createOfferDto: CreateOfferDto, @Req() req) {
  //   return this.offersService.create(createOfferDto, req.user);
  // }
}
