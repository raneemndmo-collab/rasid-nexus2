import { EmployeeEntity } from '../entities/employee.entity';

export interface IEmployeeRepository {
  save(employee: EmployeeEntity): Promise<EmployeeEntity>;
  findById(id: string, tenantId: string): Promise<EmployeeEntity | null>;
  findByUserId(userId: string, tenantId: string): Promise<EmployeeEntity | null>;
  findByEmployeeNumber(employeeNumber: string, tenantId: string): Promise<EmployeeEntity | null>;
  findByDepartment(departmentId: string, tenantId: string): Promise<EmployeeEntity[]>;
  findAll(tenantId: string): Promise<EmployeeEntity[]>;
  update(id: string, tenantId: string, data: Partial<EmployeeEntity>): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}
