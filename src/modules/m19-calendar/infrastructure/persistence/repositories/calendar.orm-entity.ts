import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('calendar_events')
@Index('idx_cal_tenant', ['tenantId'])
export class CalendarEventEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ type: 'varchar', length: 255 }) title!: string;
  @Column({ type: 'text', nullable: true }) description?: string;
  @Column({ name: 'event_type', type: 'varchar', length: 50, default: 'meeting' }) eventType!: string;
  @Column({ name: 'start_time', type: 'timestamptz' }) startTime!: Date;
  @Column({ name: 'end_time', type: 'timestamptz' }) endTime!: Date;
  @Column({ name: 'all_day', type: 'boolean', default: false }) allDay!: boolean;
  @Column({ name: 'recurrence_rule', type: 'text', nullable: true }) recurrenceRule?: string;
  @Column({ type: 'varchar', length: 500, nullable: true }) location?: string;
  @Column({ name: 'organizer_id', type: 'uuid' }) organizerId!: string;
  @Column({ type: 'jsonb', default: '[]' }) attendees!: Record<string, unknown>[];
  @Column({ type: 'varchar', length: 50, default: 'confirmed' }) status!: string;
  @Column({ name: 'reminder_minutes', type: 'int', default: 15 }) reminderMinutes!: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt!: Date;
}
