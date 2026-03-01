import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { EmployeeEntity, EmployeeStatus } from '../../domain/entities/employee.entity';
import { IEmployeeRepository } from '../../domain/interfaces/employee-repository.interface';
import { EmployeeEvents } from '../../domain/events/employee.events';
import { IEventBus } from '../../../../shared/domain/interfaces/event-bus.interface';

export interface CreateEmployeeDto {
  tenantId: string;
  userId: string;
  employeeNumber: string;
  departmentId: string;
  position: string;
  hireDate: Date;
  managerId?: string;
  salary?: number;
  workSchedule?: string;
}

export interface UpdateEmployeeDto {
  departmentId?: string;
  position?: string;
  managerId?: string;
  salary?: number;
  workSchedule?: string;
  status?: EmployeeStatus;
}

@Injectable()
export class EmployeeService {
  constructor(
    @Inject('IEmployeeRepository')
    private readonly employeeRepo: IEmployeeRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async create(dto: CreateEmployeeDto): Promise<EmployeeEntity> {
    const existing = await this.employeeRepo.findByEmployeeNumber(dto.employeeNumber, dto.tenantId);
    if (existing) throw new ConflictException('Employee number already exists');

    const employee = new EmployeeEntity({
      tenantId: dto.tenantId,
      userId: dto.userId,
      employeeNumber: dto.employeeNumber,
      departmentId: dto.departmentId,
      position: dto.position,
      hireDate: dto.hireDate,
      managerId: dto.managerId,
      salary: dto.salary,
      workSchedule: dto.workSchedule,
    });

    const saved = await this.employeeRepo.save(employee);

    await this.eventBus.publish({
      event_type: EmployeeEvents.EMPLOYEE_CREATED,
      tenant_id: dto.tenantId,
      payload: { employeeId: saved.id, userId: saved.userId, departmentId: saved.departmentId },
      timestamp: new Date(),
    });

    return saved;
  }

  async findById(id: string, tenantId: string): Promise<EmployeeEntity> {
    const emp = await this.employeeRepo.findById(id, tenantId);
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async findAll(tenantId: string): Promise<EmployeeEntity[]> {
    return this.employeeRepo.findAll(tenantId);
  }

  async findByDepartment(departmentId: string, tenantId: string): Promise<EmployeeEntity[]> {
    return this.employeeRepo.findByDepartment(departmentId, tenantId);
  }

  async update(id: string, tenantId: string, dto: UpdateEmployeeDto): Promise<EmployeeEntity> {
    const existing = await this.findById(id, tenantId);
    const oldDeptId = existing.departmentId;

    await this.employeeRepo.update(id, tenantId, dto);
    const updated = await this.findById(id, tenantId);

    if (dto.departmentId && dto.departmentId !== oldDeptId) {
      await this.eventBus.publish({
        event_type: EmployeeEvents.EMPLOYEE_TRANSFERRED,
        tenant_id: tenantId,
        payload: { employeeId: id, from_department: oldDeptId, to_department: dto.departmentId },
        timestamp: new Date(),
      });
    }

    await this.eventBus.publish({
      event_type: EmployeeEvents.EMPLOYEE_UPDATED,
      tenant_id: tenantId,
      payload: { employeeId: id, changes: dto },
      timestamp: new Date(),
    });

    return updated;
  }

  async terminate(id: string, tenantId: string): Promise<void> {
    await this.employeeRepo.update(id, tenantId, { status: EmployeeStatus.TERMINATED });

    await this.eventBus.publish({
      event_type: EmployeeEvents.EMPLOYEE_TERMINATED,
      tenant_id: tenantId,
      payload: { employeeId: id },
      timestamp: new Date(),
    });
  }
}
