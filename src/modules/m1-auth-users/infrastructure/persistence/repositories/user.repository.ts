import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string, tenantId: string): Promise<User | null> {
    return this.repo.findOne({ where: { id, tenantId } });
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    return this.repo.findOne({ where: { email, tenantId } });
  }

  async findAll(tenantId: string): Promise<User[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const entity = this.repo.create(user);
    return this.repo.save(entity);
  }

  async update(id: string, tenantId: string, data: Partial<User>): Promise<User> {
    await this.repo.update({ id, tenantId }, data);
    const updated = await this.repo.findOne({ where: { id, tenantId } });
    if (!updated) throw new Error(`User ${id} not found`);
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}
