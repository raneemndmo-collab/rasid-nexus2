import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('message_threads')
@Index('idx_thread_tenant', ['tenantId'])
export class MessageThreadEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) subject?: string;
  @Column({ type: 'varchar', length: 50, default: 'direct' }) type!: string;
  @Column({ type: 'jsonb', default: '[]' }) participants!: Record<string, unknown>[];
  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true }) lastMessageAt?: Date;
  @Column({ name: 'created_by', type: 'uuid' }) createdBy!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('messages')
@Index('idx_msg_tenant', ['tenantId'])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'thread_id', type: 'uuid' }) threadId!: string;
  @Column({ name: 'sender_id', type: 'uuid' }) senderId!: string;
  @Column({ type: 'text' }) content!: string;
  @Column({ name: 'content_type', type: 'varchar', length: 50, default: 'text' }) contentType!: string;
  @Column({ type: 'jsonb', default: '[]' }) attachments!: Record<string, unknown>[];
  @Column({ name: 'read_by', type: 'jsonb', default: '[]' }) readBy!: Record<string, unknown>[];
  @Column({ name: 'is_edited', type: 'boolean', default: false }) isEdited!: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
