import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('notifications')
export class NotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'recipient_id' })
  @Index()
  recipientId!: string;

  @Column()
  channel!: string;

  @Column({ name: 'template_id' })
  templateId!: string;

  @Column({ nullable: true })
  subject?: string;

  @Column('text')
  body!: string;

  @Column({ default: 'pending' })
  status!: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ nullable: true, name: 'sent_at' })
  sentAt?: Date;

  @Column({ nullable: true, name: 'delivered_at' })
  deliveredAt?: Date;

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('notification_templates')
export class NotificationTemplateOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column()
  name!: string;

  @Column()
  channel!: string;

  @Column({ nullable: true, name: 'subject_template' })
  subjectTemplate?: string;

  @Column('text', { name: 'body_template' })
  bodyTemplate!: string;

  @Column('jsonb', { default: '[]' })
  variables!: string[];

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('notification_preferences')
export class NotificationPreferenceOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column()
  channel!: string;

  @Column({ default: true })
  enabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
