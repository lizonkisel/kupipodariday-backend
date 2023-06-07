import { Controller, UseGuards, Post, Get, Delete, Body, Req, Param } from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from 'src/guards/jwt-guard';

@UseGuards(JwtGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  createWish(@Body() createWishDto: CreateWishDto, @Req() req) {
    return this.wishesService.create(createWishDto, req.user);
  }

  @Get(':id')
  getWishById(@Param('id') id: string) {
    return this.wishesService.findOne({
      where: {
        id: id,
      },
      relations: {
        owner: true,
        offers: true,
      },
    });
  }

  @Delete(':id')
  deleteWishById(@Param('id') id: string) {
    return this.wishesService.deleteWishById(id);
  }
}
