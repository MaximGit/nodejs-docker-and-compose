import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  create(wish: Partial<Wish>) {
    const newWish = this.wishesRepository.create(wish);
    return this.wishesRepository.save(newWish);
  }

  findOne(query: Partial<Wish>) {
    return this.wishesRepository.findOne({ where: query });
  }

  updateOne(query: Partial<Wish>, update: Partial<Wish>) {
    return this.wishesRepository.update(query, update);
  }

  removeOne(query: Partial<Wish>) {
    return this.wishesRepository.delete(query);
  }

  findLast(limit = 40) {
    return this.wishesRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['owner', 'offers'],
    });
  }

  findTop(limit = 20) {
    return this.wishesRepository.find({
      order: { copied: 'DESC' },
      take: limit,
      relations: ['owner', 'offers'],
    });
  }

  async copyWish(wishId: number, userId: number) {
    const wish = await this.wishesRepository.findOne({
      where: { id: wishId },
      relations: ['owner'],
    });

    if (!wish) {
      throw new Error('Подарок не найден');
    }

    if (wish.owner.id === userId) {
      throw new Error('Ты не можешь копировать свой подарок');
    }

    await this.wishesRepository.update(
      { id: wishId },
      { copied: wish.copied + 1 },
    );

    const copiedWish = this.wishesRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: { id: userId },
    });

    return this.wishesRepository.save(copiedWish);
  }
}
