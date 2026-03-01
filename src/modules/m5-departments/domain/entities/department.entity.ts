import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export class DepartmentEntity extends BaseEntity {
  name!: string;
  code!: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  isActive!: boolean;
  level!: number;
  path!: string; // Materialized path for tree queries: /root/parent/child

  constructor(partial: Partial<DepartmentEntity>) {
    super();
    Object.assign(this, partial);
    this.isActive = this.isActive ?? true;
    this.level = this.level ?? 0;
    this.path = this.path ?? '/';
  }
}
