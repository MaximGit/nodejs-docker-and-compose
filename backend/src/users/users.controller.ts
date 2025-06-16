import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards, UseInterceptors, Req, UnauthorizedException, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { FindOptionsWhere } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { UserPasswordInterceptor } from '../interceptors/password.user.interceptor';
import { OwnerPasswordInterceptor } from '../interceptors/password.owner.interceptor';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(UserPasswordInterceptor)
  @Get('me')
  getCurrentUser(@Req() req) {
    const user = this.usersService.findBy({ id: req.user.id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  @UseInterceptors(UserPasswordInterceptor)
  @Patch('me')
  updateCurrentUser(
    @Query() query: UpdateUserDto,
    @Body() update: UpdateUserDto,
  ) {
    const updatedUser = this.usersService.updateOne(query, update);

    if (!updatedUser) {
      throw new BadRequestException('Ошибка валидации переданных значений')
    }

    return updatedUser;
  }

  @UseInterceptors(OwnerPasswordInterceptor)
  @Get('me/wishes')
  getCurrentUserWishes(@Query() query: Partial<User>) {
    return this.usersService.getWishes(query);
  }

  @UseInterceptors(UserPasswordInterceptor)
  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });

    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }

    return user;
  }

  @UseInterceptors(OwnerPasswordInterceptor)
  @Get(':username/wishes')
  getWishesByUsername(@Param('username') username: string) {
    return this.usersService.getWishes({ username });
  }

  @UseInterceptors(UserPasswordInterceptor)
  @Post('find')
  findUsers(@Body('query') query: string) {
    return this.usersService
      .findBy(/^[\w\.-]+@[\w\.-]+\.\w{2,4}$/.test(query) ? { email: query } : { username: query });
  }
}
