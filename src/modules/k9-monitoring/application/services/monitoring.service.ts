import { Injectable, Inject } from '@nestjs/common';
import { IMetricRepository, IAlertRuleRepository, IAlertRepository, IHealthCheckRepository } from '../../domain/interfaces/monitoring-repository.interface';
import { MetricRecord, MetricType, AlertRule, Alert, AlertSeverity, AlertStatus, HealthCheck } from '../../domain/entities/monitoring.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { MONITORING_EVENTS } from '../../domain/events/monitoring.events';
import * as crypto from 'crypto';

export interface RecordMetricDto {
  tenantId: string;
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
}

export interface CreateAlertRuleDto {
  tenantId: string;
  name: string;
  metricName: string;
  condition: string;
  threshold: number;
  severity: AlertSeverity;
  cooldownMinutes?: number;
  notificationChannels?: string[];
}

export interface RecordHealthCheckDto {
  tenantId: string;
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: Record<string, unknown>;
}

@Injectable()
export class MonitoringService {
  constructor(
    @Inject('IMetricRepository') private readonly metricRepo: IMetricRepository,
    @Inject('IAlertRuleRepository') private readonly alertRuleRepo: IAlertRuleRepository,
    @Inject('IAlertRepository') private readonly alertRepo: IAlertRepository,
    @Inject('IHealthCheckRepository') private readonly healthCheckRepo: IHealthCheckRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async recordMetric(dto: RecordMetricDto): Promise<MetricRecord> {
    const metric: MetricRecord = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      name: dto.name,
      type: dto.type,
      value: dto.value,
      labels: dto.labels || {},
      timestamp: new Date(),
      createdAt: new Date(),
    };

    const saved = await this.metricRepo.save(metric);
    await this.evaluateAlertRules(dto.tenantId, dto.name, dto.value);
    return saved;
  }

  async getMetrics(name: string, tenantId: string, from: Date, to: Date): Promise<MetricRecord[]> {
    return this.metricRepo.findByName(name, tenantId, from, to);
  }

  async createAlertRule(dto: CreateAlertRuleDto): Promise<AlertRule> {
    const rule: AlertRule = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      name: dto.name,
      metricName: dto.metricName,
      condition: dto.condition,
      threshold: dto.threshold,
      severity: dto.severity,
      enabled: true,
      cooldownMinutes: dto.cooldownMinutes || 5,
      notificationChannels: dto.notificationChannels || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.alertRuleRepo.save(rule);
  }

  async getAlertRules(tenantId: string): Promise<AlertRule[]> {
    return this.alertRuleRepo.findAll(tenantId);
  }

  async getActiveAlerts(tenantId: string): Promise<Alert[]> {
    return this.alertRepo.findActive(tenantId);
  }

  async acknowledgeAlert(id: string, tenantId: string, userId: string): Promise<Alert> {
    const updated = await this.alertRepo.update(id, tenantId, {
      status: AlertStatus.ACKNOWLEDGED,
      acknowledgedBy: userId,
    });

    await this.eventBus.publish({
      event_type: MONITORING_EVENTS.ALERT_ACKNOWLEDGED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { alertId: id, acknowledgedBy: userId },
    });

    return updated;
  }

  async resolveAlert(id: string, tenantId: string): Promise<Alert> {
    const updated = await this.alertRepo.update(id, tenantId, {
      status: AlertStatus.RESOLVED,
      resolvedAt: new Date(),
    });

    await this.eventBus.publish({
      event_type: MONITORING_EVENTS.ALERT_RESOLVED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { alertId: id },
    });

    return updated;
  }

  async recordHealthCheck(dto: RecordHealthCheckDto): Promise<HealthCheck> {
    const check: HealthCheck = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      serviceName: dto.serviceName,
      status: dto.status,
      responseTime: dto.responseTime,
      details: dto.details,
      checkedAt: new Date(),
    };

    const saved = await this.healthCheckRepo.save(check);

    if (dto.status === 'unhealthy') {
      await this.eventBus.publish({
        event_type: MONITORING_EVENTS.HEALTH_CHECK_FAILED,
        tenant_id: dto.tenantId,
        timestamp: new Date(),
        payload: { serviceName: dto.serviceName, responseTime: dto.responseTime },
      });
    }

    return saved;
  }

  async getHealthChecks(tenantId: string): Promise<HealthCheck[]> {
    return this.healthCheckRepo.findAll(tenantId);
  }

  async cleanupOldMetrics(daysToKeep: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    return this.metricRepo.deleteOlderThan(cutoff);
  }

  private async evaluateAlertRules(tenantId: string, metricName: string, value: number): Promise<void> {
    const rules = await this.alertRuleRepo.findEnabled(tenantId);
    const matchingRules = rules.filter(r => r.metricName === metricName);

    for (const rule of matchingRules) {
      let triggered = false;
      switch (rule.condition) {
        case 'gt': triggered = value > rule.threshold; break;
        case 'gte': triggered = value >= rule.threshold; break;
        case 'lt': triggered = value < rule.threshold; break;
        case 'lte': triggered = value <= rule.threshold; break;
        case 'eq': triggered = value === rule.threshold; break;
        default: triggered = value > rule.threshold;
      }

      if (triggered) {
        const alert: Alert = {
          id: crypto.randomUUID(),
          tenantId,
          ruleId: rule.id,
          severity: rule.severity as AlertSeverity,
          status: AlertStatus.ACTIVE,
          message: `Alert: ${rule.name} — ${metricName} ${rule.condition} ${rule.threshold} (actual: ${value})`,
          metricValue: value,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.alertRepo.save(alert);
        await this.eventBus.publish({
          event_type: MONITORING_EVENTS.ALERT_FIRED,
          tenant_id: tenantId,
          timestamp: new Date(),
          payload: { alertId: alert.id, ruleId: rule.id, metricValue: value },
        });
      }
    }
  }
}
