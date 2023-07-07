import {
  Controller,
  UseGuards,
  Post,
  Get,
  Body,
  Req,
  Param,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { JwtGuard } from 'src/guards/jwt-guard';
import { IUserRequest } from 'src/utils/types/user-request';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @Req() req: IUserRequest) {
    return this.offersService.createOffer(createOfferDto, req.user);
  }

  @Get()
  getAllOffers() {
    return this.offersService.getAllOffers();
  }

  @Get(':id')
  getOfferById(@Param('id') id: number) {
    return this.offersService.getOfferById(id);
  }
}
