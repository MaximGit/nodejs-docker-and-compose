import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException, UseInterceptors,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerPasswordInterceptor } from '../interceptors/password.owner.interceptor';

@UseGuards(JwtGuard)
@Controller('wishlistlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @UseInterceptors(OwnerPasswordInterceptor)
  @Get()
  async getAll() {
    return await this.wishlistsService.findAll();
  }

  @Post()
  create(@Req() req: Request, @Body() body: CreateWishlistDto) {
    return this.wishlistsService.create({ ...body, owner: req.user as User });
  }

  @UseInterceptors(OwnerPasswordInterceptor)
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const wishlist = await this.wishlistsService.findOne({ id: id });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    return wishlist;
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateWishlistDto,
  ) {
    const userId = (req.user as User)['id'] as Partial<User>;
    const wishlist = await this.wishlistsService.canEditWishlist(userId, +id);

    if (this.wishlistsService.hasOffersInItems(wishlist)) {
      if ('price' in body) {
        throw new ForbiddenException('Невозможно изменить цену');
      }
    }

    if (this.wishlistsService.isRaisedImmutable(body)) {
      throw new ForbiddenException('Собранная сумма не подлежит изменению');
    }

    await this.wishlistsService.updateOne({ id: +id }, body);
    return this.wishlistsService.findOne({ id: +id });
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as User)['id'] as Partial<User>;
    const wishlist = await this.wishlistsService.canEditWishlist(userId, +id);

    if (this.wishlistsService.hasOffersInItems(wishlist)) {
      throw new ForbiddenException(
        'Нельзя удалить список желаний с предложением скинуться',
      );
    }

    return this.wishlistsService.removeOne({ id: +id });
  }
}
