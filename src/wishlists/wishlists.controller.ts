import { Controller, UseGuards, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtGuard } from 'src/guards/jwt-guard';

@UseGuards(JwtGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto, @Req() req) {
    return this.wishlistsService.create(createWishlistDto, req.user);
  }

  @Get()
  getAllWishlists() {
    return this.wishlistsService.getAllWishlists();
  }

  @Get(':id')
  getWishlistById(@Param('id') id: string) {
    return this.wishlistsService.getWishlistById(id);
  }

  @Patch(':id')
  updateWishlistById(@Body() updateWishlistDto: UpdateWishlistDto, @Param('id') id: string, @Req() req) {
    return this.wishlistsService.updateWishlistById(updateWishlistDto, id, req.user.id);
  }

  @Delete(':id')
  deleteWishlist(@Param('id') id: string) {
    return this.wishlistsService.deleteWishlist(id);
  }
}
