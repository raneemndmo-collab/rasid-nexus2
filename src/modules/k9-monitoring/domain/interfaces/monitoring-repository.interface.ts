import { MetricRecord, AlertRule, Alert, HealthCheck } from '../entities/monitoring.entity';

export interface IMetricRepository {
  save(metric: MetricRecord): Promise<MetricRecord>;
  findByName(name: string, tenantId: string, from: Date, to: Date): Promise<MetricRecord[]>;
  findLatest(name: string, tenantId: string): Promise<MetricRecord | null>;
  deleteOlderThan(date: Date): Promise<number>;
}

export interface IAlertRuleRepository {
  save(rule: AlertRule): Promise<AlertRule>;
  findById(id: string, tenantId: string): Promise<AlertRule | null>;
  findAll(tenantId: string): Promise<AlertRule[]>;
  findEnabled(tenantId: string): Promise<AlertRule[]>;
  update(id: string, tenantId: string, data: Partial<AlertRule>): Promise<AlertRule>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IAlertRepository {
  save(alert: Alert): Promise<Alert>;
  findById(id: string, tenantId: string): Promise<Alert | null>;
  findActive(tenantId: string): Promise<Alert[]>;
  findAll(tenantId: string): Promise<Alert[]>;
  update(id: string, tenantId: string, data: Partial<Alert>): Promise<Alert>;
}

export interface IHealthCheckRepository {
  save(check: HealthCheck): Promise<HealthCheck>;
  findLatest(serviceName: string, tenantId: string): Promise<HealthCheck | null>;
  findAll(tenantId: string): Promise<HealthCheck[]>;
}
