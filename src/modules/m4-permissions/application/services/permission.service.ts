import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PERMISSION_REPOSITORY, IPermissionRepository } from '../../domain/interfaces/permission-repository.interface';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { AUDIT_SERVICE, IAuditService } from '@shared/domain/interfaces/audit-service.interface';
import { Permission } from '../../domain/entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @Inject(PERMISSION_REPOSITORY) private readonly permRepo: IPermissionRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  async create(tenantId: string, data: { code: string; name: string; description: string; module: string }, actorId: string): Promise<Permission> {
    const existing = await this.permRepo.findByCode(data.code, tenantId);
    if (existing) throw new ConflictException('Permission code already exists');

    const correlationId = uuidv4();
    const perm = await this.permRepo.create({ tenantId, ...data });

    await this.auditService.log({
      tenantId, userId: actorId, action: 'CREATE_PERMISSION',
      entityType: 'permission', entityId: perm.id,
      newValue: { code: perm.code, name: perm.name },
      timestamp: new Date(), correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(), event_type: 'permission.created',
      tenant_id: tenantId, correlation_id: correlationId,
      timestamp: new Date().toISOString(), version: 1,
      payload: { permissionId: perm.id, code: perm.code },
    });

    return perm;
  }

  async findAll(tenantId: string): Promise<Permission[]> {
    return this.permRepo.findAll(tenantId);
  }

  async findById(id: string, tenantId: string): Promise<Permission> {
    const perm = await this.permRepo.findById(id, tenantId);
    if (!perm) throw new NotFoundException(`Permission ${id} not found`);
    return perm;
  }

  async checkPermission(userId: string, tenantId: string, permissionCode: string): Promise<boolean> {
    return this.permRepo.checkPermission(userId, tenantId, permissionCode);
  }

  async delete(id: string, tenantId: string, actorId: string): Promise<void> {
    const existing = await this.permRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException(`Permission ${id} not found`);

    const correlationId = uuidv4();
    await this.permRepo.delete(id, tenantId);

    await this.auditService.log({
      tenantId, userId: actorId, action: 'DELETE_PERMISSION',
      entityType: 'permission', entityId: id,
      oldValue: { code: existing.code },
      timestamp: new Date(), correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(), event_type: 'permission.deleted',
      tenant_id: tenantId, correlation_id: correlationId,
      timestamp: new Date().toISOString(), version: 1,
      payload: { permissionId: id },
    });
  }
}
