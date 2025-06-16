import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, QueryFailedError } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(user: Partial<User>) {
    try {
      const newUser = this.usersRepository.create(user);
      return this.usersRepository.save(newUser);
    } catch (err) {
      if (err instanceof QueryFailedError) {
        throw new ConflictException('Пользователь с таким email или username уже зарегистрирован');
      }
    }
  }

  findOne(query: Partial<User>) {
    return this.usersRepository.findOne({ where: query });
  }

  findBy(query: Partial<User>) {
    return this.usersRepository.findOneBy(query);
  }

  updateOne(query: Partial<User>, update: Partial<User>) {
    return this.usersRepository.update(query, update);
  }

  async getWishes(query: Partial<User>) {
    const user: User | null = await this.usersRepository.findOne({
      where: query,
      relations: ['wishes'],
    });
    return user?.wishes || [];
  }
}
