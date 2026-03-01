import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('stored_objects')
export class StoredObjectOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  bucket!: string;

  @Column()
  @Index()
  key!: string;

  @Column({ name: 'original_name' })
  originalName!: string;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column('bigint')
  size!: number;

  @Column()
  checksum!: string;

  @Column({ default: true })
  encrypted!: boolean;

  @Column({ nullable: true, name: 'encryption_key_id' })
  encryptionKeyId?: string;

  @Column({ default: 'active' })
  status!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('storage_quotas')
export class StorageQuotaOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id', unique: true })
  @Index()
  tenantId!: string;

  @Column('bigint', { name: 'max_bytes', default: 10737418240 })
  maxBytes!: number;

  @Column('bigint', { name: 'used_bytes', default: 0 })
  usedBytes!: number;

  @Column({ name: 'max_objects', default: 100000 })
  maxObjects!: number;

  @Column({ name: 'used_objects', default: 0 })
  usedObjects!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
