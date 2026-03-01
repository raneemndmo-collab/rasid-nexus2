import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('collaboration_sessions')
@Index('idx_collab_sess_tenant', ['tenantId'])
export class CollaborationSessionEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 255 }) name!: string;
  @Column({ type: 'varchar', length: 50, default: 'document' }) type!: string;
  @Column({ name: 'resource_id', type: 'uuid' }) resourceId!: string;
  @Column({ name: 'resource_type', type: 'varchar', length: 100 }) resourceType!: string;
  @Column({ type: 'varchar', length: 50, default: 'active' }) status!: string;
  @Column({ name: 'max_participants', type: 'int', default: 50 }) maxParticipants!: number;
  @Column({ name: 'created_by', type: 'uuid' }) createdBy!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true }) endedAt?: Date;
}

@Entity('collaboration_changes')
@Index('idx_collab_change_tenant', ['tenantId'])
export class CollaborationChangeEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'session_id', type: 'uuid' }) sessionId!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ name: 'change_type', type: 'varchar', length: 50 }) changeType!: string;
  @Column({ type: 'text' }) path!: string;
  @Column({ type: 'jsonb', nullable: true }) value?: unknown;
  @Column({ type: 'int' }) version!: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}

@Entity('collaboration_presence')
@Index('idx_collab_pres_tenant', ['tenantId'])
@Unique(['sessionId', 'userId'])
export class CollaborationPresenceEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'session_id', type: 'uuid' }) sessionId!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'varchar', length: 50, default: 'online' }) status!: string;
  @Column({ name: 'cursor_position', type: 'jsonb', nullable: true }) cursorPosition?: Record<string, unknown>;
  @Column({ name: 'last_seen_at', type: 'timestamptz', default: () => 'NOW()' }) lastSeenAt!: Date;
}
