import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('settings')
export class SettingOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  @Index()
  key!: string;

  @Column('text')
  value!: string;

  @Column({ default: 'string' })
  type!: string;

  @Column({ default: 'tenant' })
  scope!: string;

  @Column({ nullable: true, name: 'scope_id' })
  scopeId?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false, name: 'is_encrypted' })
  isEncrypted!: boolean;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('setting_history')
export class SettingHistoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'setting_id' })
  @Index()
  settingId!: string;

  @Column('text', { name: 'previous_value' })
  previousValue!: string;

  @Column('text', { name: 'new_value' })
  newValue!: string;

  @Column({ name: 'changed_by' })
  changedBy!: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt!: Date;
}
