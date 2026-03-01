import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRegistrationOrmEntity, ServiceEndpointOrmEntity, ServiceDependencyOrmEntity } from './registry.orm-entity';
import { IServiceRegistrationRepository, IServiceEndpointRepository, IServiceDependencyRepository } from '../../../domain/interfaces/registry-repository.interface';
import { ServiceRegistration, ServiceEndpoint, ServiceDependency } from '../../../domain/entities/registry.entity';

@Injectable()
export class ServiceRegistrationRepositoryImpl implements IServiceRegistrationRepository {
  constructor(
    @InjectRepository(ServiceRegistrationOrmEntity)
    private readonly repo: Repository<ServiceRegistrationOrmEntity>,
  ) {}

  async save(reg: ServiceRegistration): Promise<ServiceRegistration> {
    const entity = this.repo.create({
      tenantId: reg.tenantId,
      serviceName: reg.serviceName,
      version: reg.version,
      host: reg.host,
      port: reg.port,
      protocol: reg.protocol,
      healthEndpoint: reg.healthEndpoint,
      status: reg.status,
      metadata: reg.metadata,
      lastHeartbeat: reg.lastHeartbeat,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ServiceRegistration;
  }

  async findById(id: string, tenantId: string): Promise<ServiceRegistration | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as ServiceRegistration) : null;
  }

  async findByName(serviceName: string, tenantId: string): Promise<ServiceRegistration | null> {
    const entity = await this.repo.findOne({ where: { serviceName, tenantId } });
    return entity ? ({ ...entity } as unknown as ServiceRegistration) : null;
  }

  async findAll(tenantId: string): Promise<ServiceRegistration[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as ServiceRegistration));
  }

  async findActive(tenantId: string): Promise<ServiceRegistration[]> {
    const entities = await this.repo.find({ where: { tenantId, status: 'active' } });
    return entities.map(e => ({ ...e } as unknown as ServiceRegistration));
  }

  async updateStatus(id: string, tenantId: string, status: string): Promise<void> {
    await this.repo.update({ id, tenantId }, { status });
  }

  async updateHeartbeat(id: string, tenantId: string): Promise<void> {
    await this.repo.update({ id, tenantId }, { lastHeartbeat: new Date() });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class ServiceEndpointRepositoryImpl implements IServiceEndpointRepository {
  constructor(
    @InjectRepository(ServiceEndpointOrmEntity)
    private readonly repo: Repository<ServiceEndpointOrmEntity>,
  ) {}

  async save(endpoint: ServiceEndpoint): Promise<ServiceEndpoint> {
    const entity = this.repo.create({
      tenantId: endpoint.tenantId,
      serviceId: endpoint.serviceId,
      path: endpoint.path,
      method: endpoint.method,
      description: endpoint.description,
      deprecated: endpoint.deprecated,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ServiceEndpoint;
  }

  async findByService(serviceId: string, tenantId: string): Promise<ServiceEndpoint[]> {
    const entities = await this.repo.find({ where: { serviceId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as ServiceEndpoint));
  }

  async deleteByService(serviceId: string, tenantId: string): Promise<void> {
    await this.repo.delete({ serviceId, tenantId });
  }
}

@Injectable()
export class ServiceDependencyRepositoryImpl implements IServiceDependencyRepository {
  constructor(
    @InjectRepository(ServiceDependencyOrmEntity)
    private readonly repo: Repository<ServiceDependencyOrmEntity>,
  ) {}

  async save(dep: ServiceDependency): Promise<ServiceDependency> {
    const entity = this.repo.create({
      tenantId: dep.tenantId,
      sourceServiceId: dep.sourceServiceId,
      targetServiceId: dep.targetServiceId,
      dependencyType: dep.dependencyType,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as ServiceDependency;
  }

  async findBySource(sourceServiceId: string, tenantId: string): Promise<ServiceDependency[]> {
    const entities = await this.repo.find({ where: { sourceServiceId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as ServiceDependency));
  }

  async findByTarget(targetServiceId: string, tenantId: string): Promise<ServiceDependency[]> {
    const entities = await this.repo.find({ where: { targetServiceId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as ServiceDependency));
  }

  async deleteByService(serviceId: string, tenantId: string): Promise<void> {
    await this.repo.delete({ sourceServiceId: serviceId, tenantId });
  }
}
