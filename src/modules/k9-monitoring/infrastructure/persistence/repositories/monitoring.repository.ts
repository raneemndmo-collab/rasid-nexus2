import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { MetricRecordOrmEntity, AlertRuleOrmEntity, AlertOrmEntity, HealthCheckOrmEntity } from './monitoring.orm-entity';
import { IMetricRepository, IAlertRuleRepository, IAlertRepository, IHealthCheckRepository } from '../../../domain/interfaces/monitoring-repository.interface';
import { MetricRecord, AlertRule, Alert, HealthCheck } from '../../../domain/entities/monitoring.entity';

@Injectable()
export class MetricRepositoryImpl implements IMetricRepository {
  constructor(
    @InjectRepository(MetricRecordOrmEntity)
    private readonly repo: Repository<MetricRecordOrmEntity>,
  ) {}

  async save(metric: MetricRecord): Promise<MetricRecord> {
    const entity = this.repo.create({
      tenantId: metric.tenantId,
      name: metric.name,
      type: metric.type,
      value: metric.value,
      labels: metric.labels,
      timestamp: metric.timestamp,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as MetricRecord;
  }

  async findByName(name: string, tenantId: string, from: Date, to: Date): Promise<MetricRecord[]> {
    const entities = await this.repo.find({
      where: { name, tenantId, timestamp: Between(from, to) },
      order: { timestamp: 'ASC' },
    });
    return entities.map(e => ({ ...e } as unknown as MetricRecord));
  }

  async findLatest(name: string, tenantId: string): Promise<MetricRecord | null> {
    const entity = await this.repo.findOne({
      where: { name, tenantId },
      order: { timestamp: 'DESC' },
    });
    return entity ? ({ ...entity } as unknown as MetricRecord) : null;
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.repo.delete({ timestamp: LessThan(date) });
    return result.affected || 0;
  }
}

@Injectable()
export class AlertRuleRepositoryImpl implements IAlertRuleRepository {
  constructor(
    @InjectRepository(AlertRuleOrmEntity)
    private readonly repo: Repository<AlertRuleOrmEntity>,
  ) {}

  async save(rule: AlertRule): Promise<AlertRule> {
    const entity = this.repo.create({
      tenantId: rule.tenantId,
      name: rule.name,
      metricName: rule.metricName,
      condition: rule.condition,
      threshold: rule.threshold,
      severity: rule.severity,
      enabled: rule.enabled,
      cooldownMinutes: rule.cooldownMinutes,
      notificationChannels: rule.notificationChannels,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as AlertRule;
  }

  async findById(id: string, tenantId: string): Promise<AlertRule | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as AlertRule) : null;
  }

  async findAll(tenantId: string): Promise<AlertRule[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as AlertRule));
  }

  async findEnabled(tenantId: string): Promise<AlertRule[]> {
    const entities = await this.repo.find({ where: { tenantId, enabled: true } });
    return entities.map(e => ({ ...e } as unknown as AlertRule));
  }

  async update(id: string, tenantId: string, data: Partial<AlertRule>): Promise<AlertRule> {
    await this.repo.update({ id, tenantId }, data as Record<string, unknown>);
    return this.findById(id, tenantId) as Promise<AlertRule>;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class AlertRepositoryImpl implements IAlertRepository {
  constructor(
    @InjectRepository(AlertOrmEntity)
    private readonly repo: Repository<AlertOrmEntity>,
  ) {}

  async save(alert: Alert): Promise<Alert> {
    const entity = this.repo.create({
      tenantId: alert.tenantId,
      ruleId: alert.ruleId,
      severity: alert.severity,
      status: alert.status,
      message: alert.message,
      metricValue: alert.metricValue,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as Alert;
  }

  async findById(id: string, tenantId: string): Promise<Alert | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as Alert) : null;
  }

  async findActive(tenantId: string): Promise<Alert[]> {
    const entities = await this.repo.find({ where: { tenantId, status: 'active' } });
    return entities.map(e => ({ ...e } as unknown as Alert));
  }

  async findAll(tenantId: string): Promise<Alert[]> {
    const entities = await this.repo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as Alert));
  }

  async update(id: string, tenantId: string, data: Partial<Alert>): Promise<Alert> {
    await this.repo.update({ id, tenantId }, data as Record<string, unknown>);
    return this.findById(id, tenantId) as Promise<Alert>;
  }
}

@Injectable()
export class HealthCheckRepositoryImpl implements IHealthCheckRepository {
  constructor(
    @InjectRepository(HealthCheckOrmEntity)
    private readonly repo: Repository<HealthCheckOrmEntity>,
  ) {}

  async save(check: HealthCheck): Promise<HealthCheck> {
    const entity = this.repo.create({
      tenantId: check.tenantId,
      serviceName: check.serviceName,
      status: check.status,
      responseTime: check.responseTime,
      details: check.details,
      checkedAt: check.checkedAt,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as HealthCheck;
  }

  async findLatest(serviceName: string, tenantId: string): Promise<HealthCheck | null> {
    const entity = await this.repo.findOne({
      where: { serviceName, tenantId },
      order: { checkedAt: 'DESC' },
    });
    return entity ? ({ ...entity } as unknown as HealthCheck) : null;
  }

  async findAll(tenantId: string): Promise<HealthCheck[]> {
    const entities = await this.repo.find({ where: { tenantId }, order: { checkedAt: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as HealthCheck));
  }
}
