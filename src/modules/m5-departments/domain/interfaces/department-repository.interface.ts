import { DepartmentEntity } from '../entities/department.entity';

export interface IDepartmentRepository {
  save(department: DepartmentEntity): Promise<DepartmentEntity>;
  findById(id: string, tenantId: string): Promise<DepartmentEntity | null>;
  findByCode(code: string, tenantId: string): Promise<DepartmentEntity | null>;
  findAll(tenantId: string): Promise<DepartmentEntity[]>;
  findChildren(parentId: string, tenantId: string): Promise<DepartmentEntity[]>;
  findTree(tenantId: string): Promise<DepartmentEntity[]>;
  update(id: string, tenantId: string, data: Partial<DepartmentEntity>): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}
