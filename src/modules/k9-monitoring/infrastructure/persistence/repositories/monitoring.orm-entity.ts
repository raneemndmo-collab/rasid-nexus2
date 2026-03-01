import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('metric_records')
export class MetricRecordOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  @Index()
  name!: string;

  @Column()
  type!: string;

  @Column('double precision')
  value!: number;

  @Column('jsonb', { default: '{}' })
  labels!: Record<string, string>;

  @Column({ type: 'timestamp' })
  @Index()
  timestamp!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('alert_rules')
export class AlertRuleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column({ name: 'metric_name' })
  metricName!: string;

  @Column()
  condition!: string;

  @Column('double precision')
  threshold!: number;

  @Column()
  severity!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column({ name: 'cooldown_minutes', default: 5 })
  cooldownMinutes!: number;

  @Column('jsonb', { name: 'notification_channels', default: '[]' })
  notificationChannels!: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('alerts')
export class AlertOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'rule_id' })
  ruleId!: string;

  @Column()
  severity!: string;

  @Column({ default: 'active' })
  status!: string;

  @Column('text')
  message!: string;

  @Column('double precision', { name: 'metric_value' })
  metricValue!: number;

  @Column({ nullable: true, name: 'acknowledged_by' })
  acknowledgedBy?: string;

  @Column({ nullable: true, name: 'resolved_at' })
  resolvedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('health_checks')
export class HealthCheckOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'service_name' })
  serviceName!: string;

  @Column()
  status!: string;

  @Column('double precision', { name: 'response_time' })
  responseTime!: number;

  @Column('jsonb', { nullable: true })
  details?: Record<string, unknown>;

  @Column({ name: 'checked_at' })
  checkedAt!: Date;
}
