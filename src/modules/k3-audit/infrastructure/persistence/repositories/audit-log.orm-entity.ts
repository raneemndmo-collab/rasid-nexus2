import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ type: 'varchar' })
  action!: string;

  @Column({ type: 'varchar', name: 'entity_type' })
  @Index()
  entityType!: string;

  @Column({ type: 'varchar', name: 'entity_id' })
  @Index()
  entityId!: string;

  @Column({ type: 'jsonb', name: 'old_value', nullable: true })
  oldValue?: Record<string, unknown>;

  @Column({ type: 'jsonb', name: 'new_value', nullable: true })
  newValue?: Record<string, unknown>;

  @Column({ type: 'varchar', name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ type: 'uuid', name: 'correlation_id' })
  @Index()
  correlationId!: string;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;
}
