import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_notifications')
export class UserNotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column()
  title!: string;

  @Column('text')
  body!: string;

  @Column()
  type!: string;

  @Column({ default: 'medium' })
  priority!: string;

  @Column({ default: 'unread' })
  status!: string;

  @Column({ name: 'source_module' })
  sourceModule!: string;

  @Column({ nullable: true, name: 'source_id' })
  sourceId?: string;

  @Column({ nullable: true, name: 'action_url' })
  actionUrl?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ nullable: true, name: 'read_at' })
  readAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('notification_subscriptions')
export class NotificationSubscriptionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  @Column({ name: 'event_type' })
  eventType!: string;

  @Column()
  channel!: string;

  @Column({ default: true })
  enabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
