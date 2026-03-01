import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('workflow_definitions')
@Index('idx_wf_def_tenant', ['tenantId'])
export class WorkflowDefinitionEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 255 }) name!: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'int', default: 1 }) version!: number;
  @Column({ type: 'varchar', length: 50, default: 'draft' }) status!: string;
  @Column({ name: 'trigger_type', type: 'varchar', length: 50, default: 'manual' }) triggerType!: string;
  @Column({ type: 'jsonb', default: '[]' }) steps!: Record<string, unknown>[];
  @Column({ name: 'created_by', type: 'uuid' }) createdBy!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('workflow_executions')
@Index('idx_wf_exec_tenant', ['tenantId'])
export class WorkflowExecutionEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'definition_id', type: 'uuid' }) definitionId!: string;
  @Column({ type: 'varchar', length: 50, default: 'pending' }) status!: string;
  @Column({ name: 'current_step', type: 'int', default: 0 }) currentStep!: number;
  @Column({ type: 'jsonb', default: '{}' }) context!: Record<string, unknown>;
  @Column({ name: 'started_at', type: 'timestamptz', nullable: true }) startedAt?: Date;
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true }) completedAt?: Date;
  @Column({ type: 'text', nullable: true }) error?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('workflow_step_logs')
@Index('idx_wf_step_tenant', ['tenantId'])
export class WorkflowStepLogEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'execution_id', type: 'uuid' }) executionId!: string;
  @Column({ name: 'step_index', type: 'int' }) stepIndex!: number;
  @Column({ name: 'step_name', type: 'varchar', length: 255 }) stepName!: string;
  @Column({ type: 'varchar', length: 50 }) status!: string;
  @Column({ type: 'jsonb', nullable: true }) input?: Record<string, unknown>;
  @Column({ type: 'jsonb', nullable: true }) output?: Record<string, unknown>;
  @CreateDateColumn({ name: 'started_at' }) startedAt!: Date;
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true }) completedAt?: Date;
}
