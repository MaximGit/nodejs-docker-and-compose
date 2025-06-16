import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException, UseInterceptors,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { OwnerPasswordInterceptor } from '../interceptors/password.owner.interceptor';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(@Req() req: Request, @Body() body: CreateWishDto) {
    return this.wishesService.create({ ...body, owner: req.user as User });
  }

  @Get('last')
  findLast() {
    return this.wishesService.findLast();
  }

  @Get('top')
  findTop() {
    return this.wishesService.findTop();
  }

  @UseInterceptors(OwnerPasswordInterceptor)
  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wish = await this.wishesService.findOne({ id: +id });
    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    return wish;
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdateWishDto,
  ) {
    const userId = (req.user as User)['id'];
    const wish = await this.wishesService.findOne({ id: +id });

    if (!wish) throw new NotFoundException('Подарок не найден');
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя редактировать чужой подарок');
    }

    if (wish.offers && wish.offers.length > 0 && 'price' in body) {
      throw new ForbiddenException('Невозможно отредактировать цену');
    }

    if ('raised' in body) {
      throw new ForbiddenException('Собранную сумму нельзя отредактировать');
    }

    await this.wishesService.updateOne({ id: +id }, body);
    return this.wishesService.findOne({ id: +id });
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as User)['id'];
    const wish = await this.wishesService.findOne({ id: +id });

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }
    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя удалить чужой подарок');
    }
    if (wish.offers && wish.offers.length > 0) {
      throw new ForbiddenException(
        'Подарок удалить нельзя, на него уже скинулись',
      );
    }

    return this.wishesService.removeOne({ id: +id });
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  async copy(@Req() req: Request, @Param('id') id: string) {
    const userId = (req.user as User)['id'];
    return this.wishesService.copyWish(+id, userId);
  }
}
