import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ROLE_REPOSITORY, IRoleRepository } from '../../domain/interfaces/role-repository.interface';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { AUDIT_SERVICE, IAuditService } from '@shared/domain/interfaces/audit-service.interface';
import { Role } from '../../domain/entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepo: IRoleRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  async create(tenantId: string, data: { name: string; description: string; permissions: string[]; isSystem?: boolean }, actorId: string): Promise<Role> {
    const existing = await this.roleRepo.findByName(data.name, tenantId);
    if (existing) throw new ConflictException('Role name already exists');

    const correlationId = uuidv4();
    const role = await this.roleRepo.create({
      tenantId,
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      isSystem: data.isSystem || false,
    });

    await this.auditService.log({
      tenantId, userId: actorId, action: 'CREATE_ROLE',
      entityType: 'role', entityId: role.id,
      newValue: { name: role.name, permissions: role.permissions },
      timestamp: new Date(), correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(), event_type: 'role.created',
      tenant_id: tenantId, correlation_id: correlationId,
      timestamp: new Date().toISOString(), version: 1,
      payload: { roleId: role.id, name: role.name },
    });

    return role;
  }

  async findById(id: string, tenantId: string): Promise<Role> {
    const role = await this.roleRepo.findById(id, tenantId);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async findAll(tenantId: string): Promise<Role[]> {
    return this.roleRepo.findAll(tenantId);
  }

  async update(id: string, tenantId: string, data: Partial<Pick<Role, 'name' | 'description' | 'permissions'>>, actorId: string): Promise<Role> {
    const existing = await this.roleRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException(`Role ${id} not found`);

    const correlationId = uuidv4();
    const role = await this.roleRepo.update(id, tenantId, data);

    await this.auditService.log({
      tenantId, userId: actorId, action: 'UPDATE_ROLE',
      entityType: 'role', entityId: id,
      oldValue: { name: existing.name, permissions: existing.permissions },
      newValue: data as Record<string, unknown>,
      timestamp: new Date(), correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(), event_type: 'role.updated',
      tenant_id: tenantId, correlation_id: correlationId,
      timestamp: new Date().toISOString(), version: 1,
      payload: { roleId: id, changes: data },
    });

    return role;
  }

  async delete(id: string, tenantId: string, actorId: string): Promise<void> {
    const existing = await this.roleRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException(`Role ${id} not found`);

    const correlationId = uuidv4();
    await this.roleRepo.delete(id, tenantId);

    await this.auditService.log({
      tenantId, userId: actorId, action: 'DELETE_ROLE',
      entityType: 'role', entityId: id,
      oldValue: { name: existing.name },
      timestamp: new Date(), correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(), event_type: 'role.deleted',
      tenant_id: tenantId, correlation_id: correlationId,
      timestamp: new Date().toISOString(), version: 1,
      payload: { roleId: id },
    });
  }
}
