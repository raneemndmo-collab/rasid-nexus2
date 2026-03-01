import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('report_definitions')
export class ReportDefinitionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  module!: string;

  @Column('text', { name: 'query_template' })
  queryTemplate!: string;

  @Column('jsonb', { default: '[]' })
  parameters!: unknown[];

  @Column('jsonb', { default: '[]' })
  columns!: unknown[];

  @Column({ name: 'is_system', default: false })
  isSystem!: boolean;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('report_executions')
export class ReportExecutionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'definition_id' })
  @Index()
  definitionId!: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column({ default: 'pdf' })
  format!: string;

  @Column('jsonb', { default: '{}' })
  parameters!: Record<string, unknown>;

  @Column({ nullable: true, name: 'result_file_id' })
  resultFileId?: string;

  @Column({ nullable: true, name: 'row_count' })
  rowCount?: number;

  @Column({ name: 'executed_by' })
  executedBy!: string;

  @Column({ name: 'started_at' })
  startedAt!: Date;

  @Column({ nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @Column({ nullable: true, name: 'error_message' })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('scheduled_reports')
export class ScheduledReportOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'definition_id' })
  definitionId!: string;

  @Column({ name: 'cron_expression' })
  cronExpression!: string;

  @Column({ default: 'pdf' })
  format!: string;

  @Column('jsonb', { default: '{}' })
  parameters!: Record<string, unknown>;

  @Column('text', { array: true, default: '{}' })
  recipients!: string[];

  @Column({ default: true })
  enabled!: boolean;

  @Column({ nullable: true, name: 'last_run_at' })
  lastRunAt?: Date;

  @Column({ nullable: true, name: 'next_run_at' })
  nextRunAt?: Date;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
