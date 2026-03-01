import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IServiceRegistrationRepository, IServiceEndpointRepository, IServiceDependencyRepository } from '../../domain/interfaces/registry-repository.interface';
import { ServiceRegistration, ServiceStatus, ServiceEndpoint, ServiceDependency } from '../../domain/entities/registry.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { REGISTRY_EVENTS } from '../../domain/events/registry.events';
import * as crypto from 'crypto';

export interface RegisterServiceDto {
  tenantId: string;
  serviceName: string;
  version: string;
  host: string;
  port: number;
  protocol?: string;
  healthEndpoint?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class RegistryService {
  constructor(
    @Inject('IServiceRegistrationRepository') private readonly regRepo: IServiceRegistrationRepository,
    @Inject('IServiceEndpointRepository') private readonly endpointRepo: IServiceEndpointRepository,
    @Inject('IServiceDependencyRepository') private readonly depRepo: IServiceDependencyRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async register(dto: RegisterServiceDto): Promise<ServiceRegistration> {
    const existing = await this.regRepo.findByName(dto.serviceName, dto.tenantId);
    if (existing) {
      await this.regRepo.updateHeartbeat(existing.id, dto.tenantId);
      await this.regRepo.updateStatus(existing.id, dto.tenantId, ServiceStatus.ACTIVE);
      return { ...existing, status: ServiceStatus.ACTIVE, lastHeartbeat: new Date() };
    }

    const reg: ServiceRegistration = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      serviceName: dto.serviceName,
      version: dto.version,
      host: dto.host,
      port: dto.port,
      protocol: dto.protocol || 'http',
      healthEndpoint: dto.healthEndpoint || '/health',
      status: ServiceStatus.ACTIVE,
      metadata: dto.metadata,
      lastHeartbeat: new Date(),
      registeredAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.regRepo.save(reg);

    await this.eventBus.publish({
      event_type: REGISTRY_EVENTS.SERVICE_REGISTERED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { serviceId: saved.id, serviceName: dto.serviceName },
    });

    return saved;
  }

  async deregister(id: string, tenantId: string): Promise<void> {
    const reg = await this.regRepo.findById(id, tenantId);
    if (!reg) throw new BadRequestException('Service not found');

    await this.endpointRepo.deleteByService(id, tenantId);
    await this.depRepo.deleteByService(id, tenantId);
    await this.regRepo.delete(id, tenantId);

    await this.eventBus.publish({
      event_type: REGISTRY_EVENTS.SERVICE_DEREGISTERED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { serviceId: id, serviceName: reg.serviceName },
    });
  }

  async heartbeat(id: string, tenantId: string): Promise<void> {
    await this.regRepo.updateHeartbeat(id, tenantId);
  }

  async discover(serviceName: string, tenantId: string): Promise<ServiceRegistration | null> {
    return this.regRepo.findByName(serviceName, tenantId);
  }

  async listServices(tenantId: string): Promise<ServiceRegistration[]> {
    return this.regRepo.findAll(tenantId);
  }

  async listActiveServices(tenantId: string): Promise<ServiceRegistration[]> {
    return this.regRepo.findActive(tenantId);
  }

  async registerEndpoint(endpoint: Omit<ServiceEndpoint, 'id' | 'createdAt'>): Promise<ServiceEndpoint> {
    return this.endpointRepo.save({
      ...endpoint,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  async getEndpoints(serviceId: string, tenantId: string): Promise<ServiceEndpoint[]> {
    return this.endpointRepo.findByService(serviceId, tenantId);
  }

  async registerDependency(dep: Omit<ServiceDependency, 'id' | 'createdAt'>): Promise<ServiceDependency> {
    return this.depRepo.save({
      ...dep,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    });
  }

  async getDependencies(serviceId: string, tenantId: string): Promise<ServiceDependency[]> {
    return this.depRepo.findBySource(serviceId, tenantId);
  }
}
