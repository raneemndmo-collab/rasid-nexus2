import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('scheduled_jobs')
export class ScheduledJobOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column({ nullable: true, name: 'cron_expression' })
  cronExpression?: string;

  @Column({ nullable: true, name: 'scheduled_at' })
  scheduledAt?: Date;

  @Column()
  handler!: string;

  @Column('jsonb', { default: '{}' })
  payload!: Record<string, unknown>;

  @Column({ default: 'scheduled' })
  @Index()
  status!: string;

  @Column({ default: 3, name: 'max_retries' })
  maxRetries!: number;

  @Column({ default: 0, name: 'retry_count' })
  retryCount!: number;

  @Column({ nullable: true, name: 'last_run_at' })
  lastRunAt?: Date;

  @Column({ nullable: true, name: 'next_run_at' })
  @Index()
  nextRunAt?: Date;

  @Column({ nullable: true, name: 'last_error' })
  lastError?: string;

  @Column({ default: 30000, name: 'timeout_ms' })
  timeoutMs!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('job_execution_logs')
export class JobExecutionLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'job_id' })
  @Index()
  jobId!: string;

  @Column({ name: 'started_at' })
  startedAt!: Date;

  @Column({ nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @Column()
  status!: string;

  @Column({ nullable: true })
  error?: string;

  @Column({ nullable: true, name: 'duration_ms' })
  durationMs?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
