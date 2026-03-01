export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  FATAL = 'fatal',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SILENCED = 'silenced',
}

export interface MetricRecord {
  id: string;
  tenantId: string;
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
  createdAt: Date;
}

export interface AlertRule {
  id: string;
  tenantId: string;
  name: string;
  metricName: string;
  condition: string;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  cooldownMinutes: number;
  notificationChannels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  tenantId: string;
  ruleId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  metricValue: number;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthCheck {
  id: string;
  tenantId: string;
  serviceName: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  details?: Record<string, unknown>;
  checkedAt: Date;
}
