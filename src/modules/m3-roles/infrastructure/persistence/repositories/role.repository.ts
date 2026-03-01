import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';
import { IRoleRepository } from '../../../domain/interfaces/role-repository.interface';
import { Role } from '../../../domain/entities/role.entity';

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly repo: Repository<RoleOrmEntity>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Role | null> {
    return this.repo.findOne({ where: { id, tenantId } });
  }

  async findByName(name: string, tenantId: string): Promise<Role | null> {
    return this.repo.findOne({ where: { name, tenantId } });
  }

  async findAll(tenantId: string): Promise<Role[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const entity = this.repo.create(role);
    return this.repo.save(entity);
  }

  async update(id: string, tenantId: string, data: Partial<Role>): Promise<Role> {
    await this.repo.update({ id, tenantId }, data);
    const updated = await this.repo.findOne({ where: { id, tenantId } });
    if (!updated) throw new Error(`Role ${id} not found`);
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}
