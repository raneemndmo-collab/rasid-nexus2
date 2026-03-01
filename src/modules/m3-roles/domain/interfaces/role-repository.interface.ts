import { Role } from '../entities/role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface IRoleRepository {
  findById(id: string, tenantId: string): Promise<Role | null>;
  findByName(name: string, tenantId: string): Promise<Role | null>;
  findAll(tenantId: string): Promise<Role[]>;
  create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>;
  update(id: string, tenantId: string, data: Partial<Role>): Promise<Role>;
  delete(id: string, tenantId: string): Promise<void>;
}
