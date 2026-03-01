import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DepartmentEntity } from '../../domain/entities/department.entity';
import { IDepartmentRepository } from '../../domain/interfaces/department-repository.interface';
import { DepartmentEvents } from '../../domain/events/department.events';
import { IEventBus } from '../../../../shared/domain/interfaces/event-bus.interface';

export interface CreateDepartmentDto {
  tenantId: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  managerId?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  isActive?: boolean;
}

@Injectable()
export class DepartmentService {
  constructor(
    @Inject('IDepartmentRepository')
    private readonly departmentRepo: IDepartmentRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async create(dto: CreateDepartmentDto): Promise<DepartmentEntity> {
    let level = 0;
    let path = '/';

    if (dto.parentId) {
      const parent = await this.departmentRepo.findById(dto.parentId, dto.tenantId);
      if (!parent) throw new NotFoundException('Parent department not found');
      level = parent.level + 1;
      path = `${parent.path}${parent.id}/`;
    }

    const department = new DepartmentEntity({
      tenantId: dto.tenantId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      parentId: dto.parentId,
      managerId: dto.managerId,
      level,
      path,
    });

    const saved = await this.departmentRepo.save(department);

    await this.eventBus.publish({
      event_type: DepartmentEvents.DEPARTMENT_CREATED,
      tenant_id: dto.tenantId,
      payload: { departmentId: saved.id, name: saved.name, code: saved.code, parentId: saved.parentId },
      timestamp: new Date(),
    });

    return saved;
  }

  async findById(id: string, tenantId: string): Promise<DepartmentEntity> {
    const dept = await this.departmentRepo.findById(id, tenantId);
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async findAll(tenantId: string): Promise<DepartmentEntity[]> {
    return this.departmentRepo.findAll(tenantId);
  }

  async getTree(tenantId: string): Promise<DepartmentEntity[]> {
    return this.departmentRepo.findTree(tenantId);
  }

  async getChildren(parentId: string, tenantId: string): Promise<DepartmentEntity[]> {
    return this.departmentRepo.findChildren(parentId, tenantId);
  }

  async update(id: string, tenantId: string, dto: UpdateDepartmentDto): Promise<DepartmentEntity> {
    await this.departmentRepo.update(id, tenantId, dto);
    const updated = await this.findById(id, tenantId);

    await this.eventBus.publish({
      event_type: DepartmentEvents.DEPARTMENT_UPDATED,
      tenant_id: tenantId,
      payload: { departmentId: id, changes: dto },
      timestamp: new Date(),
    });

    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const children = await this.departmentRepo.findChildren(id, tenantId);
    if (children.length > 0) {
      throw new Error('Cannot delete department with children');
    }

    await this.departmentRepo.delete(id, tenantId);

    await this.eventBus.publish({
      event_type: DepartmentEvents.DEPARTMENT_DELETED,
      tenant_id: tenantId,
      payload: { departmentId: id },
      timestamp: new Date(),
    });
  }
}
