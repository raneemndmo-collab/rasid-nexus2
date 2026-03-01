import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('events')
export class EventOrmEntity {
  @PrimaryColumn({ type: 'uuid', name: 'event_id' })
  eventId!: string;

  @Column({ type: 'varchar', name: 'event_type' })
  @Index()
  eventType!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'correlation_id' })
  @Index()
  correlationId!: string;

  @Column({ type: 'timestamp' })
  timestamp!: Date;

  @Column({ type: 'integer' })
  version!: number;

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @CreateDateColumn({ name: 'stored_at' })
  storedAt!: Date;
}

@Entity('event_schemas')
export class EventSchemaOrmEntity {
  @PrimaryColumn({ type: 'varchar', name: 'event_type' })
  eventType!: string;

  @Column({ type: 'jsonb' })
  schema!: Record<string, unknown>;

  @Column({ type: 'integer' })
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}

@Entity('dead_letter_queue')
export class DlqOrmEntity {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Column({ type: 'jsonb' })
  event!: Record<string, unknown>;

  @Column({ type: 'varchar' })
  error!: string;

  @Column({ type: 'integer' })
  attempts!: number;

  @Column({ type: 'boolean', default: false })
  processed!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
