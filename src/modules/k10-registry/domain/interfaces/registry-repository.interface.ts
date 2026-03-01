import { ServiceRegistration, ServiceEndpoint, ServiceDependency } from '../entities/registry.entity';

export interface IServiceRegistrationRepository {
  save(registration: ServiceRegistration): Promise<ServiceRegistration>;
  findById(id: string, tenantId: string): Promise<ServiceRegistration | null>;
  findByName(serviceName: string, tenantId: string): Promise<ServiceRegistration | null>;
  findAll(tenantId: string): Promise<ServiceRegistration[]>;
  findActive(tenantId: string): Promise<ServiceRegistration[]>;
  updateStatus(id: string, tenantId: string, status: string): Promise<void>;
  updateHeartbeat(id: string, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IServiceEndpointRepository {
  save(endpoint: ServiceEndpoint): Promise<ServiceEndpoint>;
  findByService(serviceId: string, tenantId: string): Promise<ServiceEndpoint[]>;
  deleteByService(serviceId: string, tenantId: string): Promise<void>;
}

export interface IServiceDependencyRepository {
  save(dependency: ServiceDependency): Promise<ServiceDependency>;
  findBySource(sourceServiceId: string, tenantId: string): Promise<ServiceDependency[]>;
  findByTarget(targetServiceId: string, tenantId: string): Promise<ServiceDependency[]>;
  deleteByService(serviceId: string, tenantId: string): Promise<void>;
}
