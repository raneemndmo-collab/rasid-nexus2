export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEGRADED = 'degraded',
  MAINTENANCE = 'maintenance',
}

export interface ServiceRegistration {
  id: string;
  tenantId: string;
  serviceName: string;
  version: string;
  host: string;
  port: number;
  protocol: string;
  healthEndpoint: string;
  status: ServiceStatus;
  metadata?: Record<string, unknown>;
  lastHeartbeat: Date;
  registeredAt: Date;
  updatedAt: Date;
}

export interface ServiceEndpoint {
  id: string;
  tenantId: string;
  serviceId: string;
  path: string;
  method: string;
  description?: string;
  deprecated: boolean;
  createdAt: Date;
}

export interface ServiceDependency {
  id: string;
  tenantId: string;
  sourceServiceId: string;
  targetServiceId: string;
  dependencyType: 'required' | 'optional';
  createdAt: Date;
}
