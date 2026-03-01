import { Injectable, Scope, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantOrmEntity } from './tenant.orm-entity';
import { ITenantRepository } from '../../../domain/interfaces/tenant-repository.interface';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class TenantRepository implements ITenantRepository {
  constructor(
    @InjectRepository(TenantOrmEntity)
    private readonly repo: Repository<TenantOrmEntity>,
    @Inject(REQUEST) private readonly request: { tenantId?: string },
  ) {}

  /** Get the current tenant_id from request context for RLS filtering */
  private get tenantId(): string | undefined {
    return this.request?.tenantId;
  }

  async findById(id: string): Promise<Tenant | null> {
    // Tenant management: filter by tenant_id when available (self-lookup)
    const where: Record<string, unknown> = { id };
    if (this.tenantId) where.tenant_id = this.tenantId;
    return this.repo.findOne({ where });
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async findAll(): Promise<Tenant[]> {
    // RLS enforced at DB level via tenant_id; additional app-level filter
    if (this.tenantId) {
      return this.repo.find({ where: { tenant_id: this.tenantId } as any });
    }
    return this.repo.find();
  }

  async create(tenant: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    const entity = this.repo.create(tenant);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const where: Record<string, unknown> = { id };
    if (this.tenantId) where.tenant_id = this.tenantId;
    const existing = await this.repo.findOne({ where });
    if (!existing) throw new Error(`Tenant ${id} not found`);
    Object.assign(existing, data);
    return this.repo.save(existing);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
