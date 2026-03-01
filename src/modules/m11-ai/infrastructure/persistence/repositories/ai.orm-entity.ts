import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('ai_models')
export class AIModelOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column()
  provider!: string;

  @Column({ name: 'model_id' })
  modelId!: string;

  @Column('text', { array: true })
  capabilities!: string[];

  @Column({ name: 'fallback_level', default: 'L0' })
  fallbackLevel!: string;

  @Column({ default: 'active' })
  status!: string;

  @Column('decimal', { name: 'cost_per_token', precision: 10, scale: 8, default: 0 })
  costPerToken!: number;

  @Column({ name: 'max_tokens', default: 4096 })
  maxTokens!: number;

  @Column('jsonb', { nullable: true })
  config?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('prompt_templates')
export class PromptTemplateOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  @Index()
  name!: string;

  @Column()
  capability!: string;

  @Column('text')
  template!: string;

  @Column({ default: 1 })
  version!: number;

  @Column('text', { array: true, default: '{}' })
  variables!: string[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('ai_usage_logs')
export class AIUsageLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'model_id' })
  @Index()
  modelId!: string;

  @Column()
  capability!: string;

  @Column({ name: 'prompt_tokens', default: 0 })
  promptTokens!: number;

  @Column({ name: 'completion_tokens', default: 0 })
  completionTokens!: number;

  @Column({ name: 'total_tokens', default: 0 })
  totalTokens!: number;

  @Column('decimal', { precision: 10, scale: 6, default: 0 })
  cost!: number;

  @Column({ name: 'latency_ms', default: 0 })
  latencyMs!: number;

  @Column('decimal', { name: 'quality_score', precision: 5, scale: 2, nullable: true })
  qualityScore?: number;

  @Column({ name: 'fallback_level', default: 'L0' })
  fallbackLevel!: string;

  @Column({ default: true })
  success!: boolean;

  @Column({ nullable: true, name: 'error_message' })
  errorMessage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('tenant_ai_budgets')
export class TenantAIBudgetOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column('decimal', { name: 'monthly_budget', precision: 10, scale: 2, default: 100 })
  monthlyBudget!: number;

  @Column('decimal', { name: 'used_budget', precision: 10, scale: 2, default: 0 })
  usedBudget!: number;

  @Column({ name: 'budget_month' })
  @Index()
  budgetMonth!: string;

  @Column({ name: 'alert_threshold', default: 80 })
  alertThreshold!: number;

  @Column({ name: 'is_exceeded', default: false })
  isExceeded!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('ai_kill_switches')
export class AIKillSwitchOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', unique: true })
  @Index()
  tenantId!: string;

  @Column({ name: 'is_active', default: false })
  isActive!: boolean;

  @Column({ nullable: true, name: 'activated_by' })
  activatedBy?: string;

  @Column({ nullable: true, name: 'activated_at' })
  activatedAt?: Date;

  @Column({ nullable: true })
  reason?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
