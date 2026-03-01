import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('form_definitions')
@Index('idx_form_def_tenant', ['tenantId'])
export class FormDefinitionEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 255 }) name!: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'int', default: 1 }) version!: number;
  @Column({ type: 'varchar', length: 50, default: 'draft' }) status!: string;
  @Column({ type: 'jsonb', default: '[]' }) fields!: Record<string, unknown>[];
  @Column({ name: 'validation_rules', type: 'jsonb', default: '[]' }) validationRules!: Record<string, unknown>[];
  @Column({ name: 'created_by', type: 'uuid' }) createdBy!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('form_submissions')
@Index('idx_form_sub_tenant', ['tenantId'])
export class FormSubmissionEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'form_id', type: 'uuid' }) formId!: string;
  @Column({ name: 'submitted_by', type: 'uuid' }) submittedBy!: string;
  @Column({ type: 'jsonb', default: '{}' }) data!: Record<string, unknown>;
  @Column({ name: 'validation_status', type: 'varchar', length: 50, default: 'valid' }) validationStatus!: string;
  @Column({ name: 'validation_errors', type: 'jsonb', nullable: true }) validationErrors?: Record<string, string>[];
  @CreateDateColumn({ name: 'submitted_at' }) submittedAt!: Date;
}
