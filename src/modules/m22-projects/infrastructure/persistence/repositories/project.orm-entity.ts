import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('projects')
@Index('idx_proj_tenant', ['tenantId'])
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 255 }) name!: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'varchar', length: 50, default: 'active' }) status!: string;
  @Column({ name: 'start_date', type: 'date', nullable: true }) startDate?: Date;
  @Column({ name: 'end_date', type: 'date', nullable: true }) endDate?: Date;
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true }) budget?: number;
  @Column({ name: 'owner_id', type: 'uuid' }) ownerId!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('project_members')
@Index('idx_proj_member_tenant', ['tenantId'])
@Unique(['projectId', 'userId'])
export class ProjectMemberEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'project_id', type: 'uuid' }) projectId!: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId!: string;
  @Column({ type: 'varchar', length: 50, default: 'member' }) role!: string;
  @CreateDateColumn({ name: 'joined_at' }) joinedAt!: Date;
}
