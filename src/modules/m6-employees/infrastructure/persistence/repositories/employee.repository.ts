import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeOrmEntity } from './employee.orm-entity';
import { IEmployeeRepository } from '../../../domain/interfaces/employee-repository.interface';
import { EmployeeEntity } from '../../../domain/entities/employee.entity';

@Injectable()
export class EmployeeRepositoryImpl implements IEmployeeRepository {
  constructor(
    @InjectRepository(EmployeeOrmEntity)
    private readonly repo: Repository<EmployeeOrmEntity>,
  ) {}

  async save(employee: EmployeeEntity): Promise<EmployeeEntity> {
    const entity = this.repo.create({
      tenantId: employee.tenantId,
      userId: employee.userId,
      employeeNumber: employee.employeeNumber,
      departmentId: employee.departmentId,
      position: employee.position,
      hireDate: employee.hireDate,
      status: employee.status,
      managerId: employee.managerId,
      salary: employee.salary,
      workSchedule: employee.workSchedule,
      metadata: employee.metadata,
    });
    const saved = await this.repo.save(entity);
    return new EmployeeEntity({ ...saved } as Partial<EmployeeEntity>);
  }

  async findById(id: string, tenantId: string): Promise<EmployeeEntity | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId: tenantId } });
    return entity ? new EmployeeEntity({ ...entity } as Partial<EmployeeEntity>) : null;
  }

  async findByUserId(userId: string, tenantId: string): Promise<EmployeeEntity | null> {
    const entity = await this.repo.findOne({ where: { userId: userId, tenantId: tenantId } });
    return entity ? new EmployeeEntity({ ...entity } as Partial<EmployeeEntity>) : null;
  }

  async findByEmployeeNumber(employeeNumber: string, tenantId: string): Promise<EmployeeEntity | null> {
    const entity = await this.repo.findOne({ where: { employeeNumber: employeeNumber, tenantId: tenantId } });
    return entity ? new EmployeeEntity({ ...entity } as Partial<EmployeeEntity>) : null;
  }

  async findByDepartment(departmentId: string, tenantId: string): Promise<EmployeeEntity[]> {
    const entities = await this.repo.find({ where: { departmentId: departmentId, tenantId: tenantId } });
    return entities.map(e => new EmployeeEntity({ ...e } as Partial<EmployeeEntity>));
  }

  async findAll(tenantId: string): Promise<EmployeeEntity[]> {
    const entities = await this.repo.find({ where: { tenantId: tenantId } });
    return entities.map(e => new EmployeeEntity({ ...e } as Partial<EmployeeEntity>));
  }

  async update(id: string, tid: string, data: Partial<EmployeeEntity>): Promise<void> {
    const { tenantId: _unused, ...updateData } = data;
    await this.repo.update({ id, tenantId: tid }, updateData as Record<string, unknown>);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId: tenantId });
  }
}
