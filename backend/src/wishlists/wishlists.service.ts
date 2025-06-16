import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async findAll() {
    const wishlists = await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });

    if (!wishlists) {
      throw new NotFoundException('Списки желаний не найдены');
    }

    return wishlists;
  }

  create(wishlist: Partial<Wishlist>) {
    const newWishlist = this.wishlistRepository.create(wishlist);
    return this.wishlistRepository.save(newWishlist);
  }

  findOne(query: Partial<Wishlist>) {
    return this.wishlistRepository.findOne({
      where: query,
      relations: ['owner', 'items'],
    });
  }

  updateOne(query: Partial<Wishlist>, update: Partial<Wishlist>) {
    return this.wishlistRepository.update(query, update);
  }

  removeOne(query: Partial<Wishlist>) {
    return this.wishlistRepository.delete(query);
  }

  async canEditWishlist(userId: Partial<User>, wishlistId: number) {
    const wishlist = await this.findOne({ id: wishlistId });
    if (!wishlist) {
      throw new NotFoundException('Список желаний не найден');
    }
    if (wishlist.owner.id !== userId) {
      throw new ForbiddenException(
        'Вы можете редактировать только собственный список желаний',
      );
    }
    return wishlist;
  }

  hasOffersInItems(wishlist: Wishlist) {
    return wishlist.items?.some(
      (wish: Wish) => wish.offers && wish.offers.length > 0,
    );
  }

  isRaisedImmutable(updateData: Partial<Wishlist>) {
    return 'raised' in updateData;
  }
}
