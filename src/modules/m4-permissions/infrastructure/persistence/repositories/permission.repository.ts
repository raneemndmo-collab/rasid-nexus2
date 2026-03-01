import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionOrmEntity } from './permission.orm-entity';
import { IPermissionRepository } from '../../../domain/interfaces/permission-repository.interface';
import { Permission } from '../../../domain/entities/permission.entity';

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly repo: Repository<PermissionOrmEntity>,
  ) {}

  async findById(id: string, tenantId: string): Promise<Permission | null> {
    return this.repo.findOne({ where: { id, tenantId } });
  }

  async findByCode(code: string, tenantId: string): Promise<Permission | null> {
    return this.repo.findOne({ where: { code, tenantId } });
  }

  async findAll(tenantId: string): Promise<Permission[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async findByModule(module: string, tenantId: string): Promise<Permission[]> {
    return this.repo.find({ where: { module, tenantId } });
  }

  async create(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission> {
    const entity = this.repo.create(permission);
    return this.repo.save(entity);
  }

  async update(id: string, tenantId: string, data: Partial<Permission>): Promise<Permission> {
    await this.repo.update({ id, tenantId }, data);
    const updated = await this.repo.findOne({ where: { id, tenantId } });
    if (!updated) throw new Error(`Permission ${id} not found`);
    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  async checkPermission(_userId: string, tenantId: string, permissionCode: string): Promise<boolean> {
    // In Phase 0, this is a basic check. Full RBAC integration comes with role-permission mapping.
    const permission = await this.findByCode(permissionCode, tenantId);
    return !!permission;
  }
}
