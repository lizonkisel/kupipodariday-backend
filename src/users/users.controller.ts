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
import { IUserRequest } from 'src/utils/types/user-request';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: IUserRequest): Promise<UserProfileResponseDto> {
    return this.usersService.getMe(req.user.id);
  }

  @Patch('me')
  updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: IUserRequest) {
    const currentUserId = req.user.id;
    return this.usersService.updateUser(updateUserDto, currentUserId);
  }

  @Get('me/wishes')
  getMyWishes(@Req() req: IUserRequest) {
    const currentUserId = req.user.id;
    return this.usersService.getMyWishes(currentUserId);
  }

  @Get(':username')
  getUserByUsername(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Get(':username/wishes')
  getWishesByUsername(@Param('username') username: string) {
    return this.usersService.getWishesByUsername(username);
  }

  @Post('find')
  findUsers(@Body() queryObj: { query: string }) {
    return this.usersService.findUsers(queryObj);
  }
}
