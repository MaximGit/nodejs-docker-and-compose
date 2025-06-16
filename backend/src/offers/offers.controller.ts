import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offers')
@UseGuards(JwtGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() offerData: CreateOfferDto, @Req() req) {
    const userId = (req.user as User)['id'];
    return this.offersService.create({
      amount: offerData.amount,
      hidden: offerData.hidden ?? false,
      item: { id: offerData.itemId } as Wish,
      user: { id: userId } as User,
    });
  }
}
