import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('managed_files')
export class ManagedFileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'storage_object_id' })
  storageObjectId!: string;

  @Column()
  name!: string;

  @Column({ name: 'original_name' })
  originalName!: string;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column('bigint')
  size!: number;

  @Column({ nullable: true, name: 'folder_id' })
  folderId?: string;

  @Column('text', { array: true, default: '{}' })
  tags!: string[];

  @Column({ nullable: true, name: 'thumbnail_id' })
  thumbnailId?: string;

  @Column({ default: 'active' })
  status!: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('folders')
export class FolderOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column({ nullable: true, name: 'parent_id' })
  parentId?: string;

  @Column()
  path!: string;

  @Column({ name: 'created_by' })
  createdBy!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('file_shares')
export class FileShareOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'file_id' })
  @Index()
  fileId!: string;

  @Column({ name: 'shared_with' })
  sharedWith!: string;

  @Column({ default: 'view' })
  permission!: string;

  @Column({ nullable: true, name: 'expires_at' })
  expiresAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
