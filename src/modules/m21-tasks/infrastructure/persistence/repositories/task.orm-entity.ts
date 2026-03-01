import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('tasks')
@Index('idx_task_tenant', ['tenantId'])
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 500 }) title!: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ type: 'varchar', length: 50, default: 'todo' }) status!: string;
  @Column({ type: 'varchar', length: 20, default: 'medium' }) priority!: string;
  @Column({ name: 'assignee_id', type: 'uuid', nullable: true }) assigneeId?: string;
  @Column({ name: 'reporter_id', type: 'uuid' }) reporterId!: string;
  @Column({ name: 'due_date', type: 'timestamptz', nullable: true }) dueDate?: Date;
  @Column({ name: 'estimated_hours', type: 'decimal', precision: 6, scale: 2, nullable: true }) estimatedHours?: number;
  @Column({ name: 'actual_hours', type: 'decimal', precision: 6, scale: 2, nullable: true }) actualHours?: number;
  @Column({ type: 'jsonb', default: '[]' }) tags!: string[];
  @Column({ name: 'parent_task_id', type: 'uuid', nullable: true }) parentTaskId?: string;
  @Column({ name: 'project_id', type: 'uuid', nullable: true }) projectId?: string;
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true }) completedAt?: Date;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}

@Entity('task_comments')
@Index('idx_task_comment_tenant', ['tenantId'])
export class TaskCommentEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'task_id', type: 'uuid' }) taskId!: string;
  @Column({ name: 'author_id', type: 'uuid' }) authorId!: string;
  @Column({ type: 'text' }) content!: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
}
