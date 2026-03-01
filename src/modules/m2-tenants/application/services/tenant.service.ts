import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { TENANT_REPOSITORY, ITenantRepository } from '../../domain/interfaces/tenant-repository.interface';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { AUDIT_SERVICE, IAuditService } from '@shared/domain/interfaces/audit-service.interface';
import { Tenant } from '../../domain/entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(AUDIT_SERVICE) private readonly auditService: IAuditService,
  ) {}

  async create(data: { name: string; slug: string; plan?: string; settings?: Record<string, unknown> }, actorId: string): Promise<Tenant> {
    const existing = await this.tenantRepo.findBySlug(data.slug);
    if (existing) throw new ConflictException('Tenant slug already exists');

    const correlationId = uuidv4();
    const tenant = await this.tenantRepo.create({
      name: data.name,
      slug: data.slug,
      isActive: true,
      plan: data.plan || 'basic',
      settings: data.settings || {},
    });

    await this.auditService.log({
      tenantId: tenant.id,
      userId: actorId,
      action: 'CREATE_TENANT',
      entityType: 'tenant',
      entityId: tenant.id,
      newValue: { name: tenant.name, slug: tenant.slug },
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'tenant.created',
      tenant_id: tenant.id,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { tenantId: tenant.id, name: tenant.name, slug: tenant.slug },
    });

    return tenant;
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findById(id);
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepo.findAll();
  }

  async update(id: string, data: Partial<Pick<Tenant, 'name' | 'isActive' | 'plan' | 'settings'>>, actorId: string): Promise<Tenant> {
    const existing = await this.tenantRepo.findById(id);
    if (!existing) throw new NotFoundException(`Tenant ${id} not found`);

    const correlationId = uuidv4();
    const tenant = await this.tenantRepo.update(id, data);

    await this.auditService.log({
      tenantId: id,
      userId: actorId,
      action: 'UPDATE_TENANT',
      entityType: 'tenant',
      entityId: id,
      oldValue: { name: existing.name },
      newValue: data as Record<string, unknown>,
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'tenant.updated',
      tenant_id: id,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { tenantId: id, changes: data },
    });

    return tenant;
  }

  async delete(id: string, actorId: string): Promise<void> {
    const existing = await this.tenantRepo.findById(id);
    if (!existing) throw new NotFoundException(`Tenant ${id} not found`);

    const correlationId = uuidv4();
    await this.tenantRepo.delete(id);

    await this.auditService.log({
      tenantId: id,
      userId: actorId,
      action: 'DELETE_TENANT',
      entityType: 'tenant',
      entityId: id,
      oldValue: { name: existing.name },
      timestamp: new Date(),
      correlationId,
    });

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'tenant.deleted',
      tenant_id: id,
      correlation_id: correlationId,
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { tenantId: id },
    });
  }
}
