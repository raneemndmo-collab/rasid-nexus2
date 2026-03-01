import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantOrmEntity } from './tenant.orm-entity';
import { ITenantRepository } from '../../../domain/interfaces/tenant-repository.interface';
import { Tenant } from '../../../domain/entities/tenant.entity';

@Injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantOrmEntity)
    private readonly repo: Repository<TenantOrmEntity>,
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findAll(): Promise<Tenant[]> {
    return this.repo.find();
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const entity = this.repo.create(tenant);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new Error(`Tenant ${id} not found`);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
