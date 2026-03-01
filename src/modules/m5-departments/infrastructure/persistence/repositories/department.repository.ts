import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentOrmEntity } from './department.orm-entity';
import { IDepartmentRepository } from '../../../domain/interfaces/department-repository.interface';
import { DepartmentEntity } from '../../../domain/entities/department.entity';

@Injectable()
export class DepartmentRepositoryImpl implements IDepartmentRepository {
  constructor(
    @InjectRepository(DepartmentOrmEntity)
    private readonly repo: Repository<DepartmentOrmEntity>,
  ) {}

  async save(department: DepartmentEntity): Promise<DepartmentEntity> {
    const entity = this.repo.create({
      tenantId: department.tenantId,
      name: department.name,
      code: department.code,
      description: department.description,
      parentId: department.parentId,
      managerId: department.managerId,
      isActive: department.isActive,
      level: department.level,
      path: department.path,
    });
    const saved = await this.repo.save(entity);
    return new DepartmentEntity({ ...saved } as Partial<DepartmentEntity>);
  }

  async findById(id: string, tenantId: string): Promise<DepartmentEntity | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId: tenantId } });
    return entity ? new DepartmentEntity({ ...entity } as Partial<DepartmentEntity>) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<DepartmentEntity | null> {
    const entity = await this.repo.findOne({ where: { code, tenantId: tenantId } });
    return entity ? new DepartmentEntity({ ...entity } as Partial<DepartmentEntity>) : null;
  }

  async findAll(tenantId: string): Promise<DepartmentEntity[]> {
    const entities = await this.repo.find({ where: { tenantId: tenantId }, order: { path: 'ASC' } });
    return entities.map(e => new DepartmentEntity({ ...e } as Partial<DepartmentEntity>));
  }

  async findChildren(parentId: string, tenantId: string): Promise<DepartmentEntity[]> {
    const entities = await this.repo.find({ where: { parentId: parentId, tenantId: tenantId } });
    return entities.map(e => new DepartmentEntity({ ...e } as Partial<DepartmentEntity>));
  }

  async findTree(tenantId: string): Promise<DepartmentEntity[]> {
    const entities = await this.repo.find({ where: { tenantId: tenantId }, order: { level: 'ASC', path: 'ASC' } });
    return entities.map(e => new DepartmentEntity({ ...e } as Partial<DepartmentEntity>));
  }

  async update(id: string, tid: string, data: Partial<DepartmentEntity>): Promise<void> {
    const { tenantId: _unused, ...updateData } = data;
    await this.repo.update({ id, tenantId: tid }, updateData as Record<string, unknown>);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId: tenantId });
  }
}
