import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';
import { User } from 'src/users/entities/user.entity';
import { WishesService } from 'src/wishes/wishes.service';
import { Wish } from 'src/wishes/entities/wish.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  // create(createWishlistDto: CreateWishlistDto, owner: User) {
  //   const wishesId = createWishlistDto.itemsId;
  //   const items = this.wishesService.findMany(wishesId);

  //   if (!wishes) {
  //     throw new HttpException(
  //       'Нельзя добавить в вишлист несуществующий подарок',
  //       404,
  //     );
  //   }

  //   const wishlist = this.wishlistRepository.create({
  //     ...createWishlistDto,
  //     owner,
  //     items,
  //   });
  //   return 'This action adds a new wishlist';
  // }
}
