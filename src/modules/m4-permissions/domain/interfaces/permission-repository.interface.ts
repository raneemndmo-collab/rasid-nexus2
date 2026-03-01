import { Permission } from '../entities/permission.entity';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface IPermissionRepository {
  findById(id: string, tenantId: string): Promise<Permission | null>;
  findByCode(code: string, tenantId: string): Promise<Permission | null>;
  findAll(tenantId: string): Promise<Permission[]>;
  findByModule(module: string, tenantId: string): Promise<Permission[]>;
  create(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission>;
  update(id: string, tenantId: string, data: Partial<Permission>): Promise<Permission>;
  delete(id: string, tenantId: string): Promise<void>;
  checkPermission(userId: string, tenantId: string, permissionCode: string): Promise<boolean>;
}
