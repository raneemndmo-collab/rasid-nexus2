import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
}

export class EmployeeEntity extends BaseEntity {
  userId!: string;
  employeeNumber!: string;
  departmentId!: string;
  position!: string;
  hireDate!: Date;
  status!: EmployeeStatus;
  managerId?: string;
  salary?: number;
  workSchedule?: string; // e.g., "SUN-THU 08:00-17:00"
  metadata?: Record<string, unknown>;

  constructor(partial: Partial<EmployeeEntity>) {
    super();
    Object.assign(this, partial);
    this.status = this.status || EmployeeStatus.ACTIVE;
  }
}
