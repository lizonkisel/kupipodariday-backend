import {
  Controller,
  UseGuards,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  Param,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from 'src/guards/jwt-guard';
import { IUserRequest } from 'src/utils/types/user-request';

@UseGuards(JwtGuard)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('last')
  getLast() {
    return this.wishesService.getLast();
  }

  @Get('top')
  getTop() {
    return this.wishesService.getTop();
  }

  @Post()
  createWish(@Body() createWishDto: CreateWishDto, @Req() req: IUserRequest) {
    return this.wishesService.create(createWishDto, req.user);
  }

  @Post(':id/copy')
  copyWish(@Param('id') id: number, @Req() req: IUserRequest) {
    const wishId = id;
    const currentUserId = req.user.id;
    return this.wishesService.copyWish(wishId, currentUserId);
  }

  @Get(':id')
  getWishById(@Param('id') id: number) {
    return this.wishesService.getWishById(id);
  }

  @Patch(':id')
  updateWish(
    @Param('id') id: number,
    @Req() req: IUserRequest,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    const wishId = id;
    const currentUserId = req.user.id;
    return this.wishesService.updateWish(wishId, currentUserId, updateWishDto);
  }

  @Delete(':id')
  deleteWishById(@Param('id') id: number, @Req() req: IUserRequest) {
    const wishId = id;
    const currentUserId = req.user.id;
    return this.wishesService.deleteWishById(wishId, currentUserId);
  }
}
