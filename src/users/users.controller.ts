import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../guards/jwt-guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req): Promise<UserProfileResponseDto> {
    const user = req.user;
    delete user.password;
    return user;
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch('me')
  updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req) {
    const currentUserId = req.user.id;
    return this.usersService.updateUser(updateUserDto, currentUserId);
  }

  @Get('me/wishes')
  getMyWishes(@Req() req) {
    const currentUserId = req.user.id;
    return this.usersService.getMyWishes(currentUserId);
  }

  // @Get(':username')
  // @Get(':username/wishes')
}
