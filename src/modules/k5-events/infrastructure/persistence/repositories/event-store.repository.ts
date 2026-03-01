import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventOrmEntity, EventSchemaOrmEntity, DlqOrmEntity } from './event.orm-entity';
import { IEventStore, ISchemaRegistry, IDlqService, EventSchema } from '../../../domain/interfaces/event-store.interface';
import { EventEnvelope } from '@shared/domain/events/event-envelope';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventStoreRepository implements IEventStore {
  constructor(
    @InjectRepository(EventOrmEntity)
    private readonly repo: Repository<EventOrmEntity>,
  ) {}

  async store(event: EventEnvelope): Promise<void> {
    const entity = this.repo.create({
      eventId: event.event_id,
      eventType: event.event_type,
      tenantId: event.tenant_id,
      correlationId: event.correlation_id,
      timestamp: new Date(event.timestamp),
      version: event.version,
      payload: event.payload as Record<string, unknown>,
    });
    await this.repo.save(entity);
  }

  async getById(eventId: string): Promise<EventEnvelope | null> {
    const entity = await this.repo.findOne({ where: { eventId } });
    if (!entity) return null;
    return this.toEnvelope(entity);
  }

  async getByCorrelation(correlationId: string): Promise<EventEnvelope[]> {
    const entities = await this.repo.find({ where: { correlationId } });
    return entities.map(e => this.toEnvelope(e));
  }

  async getByType(eventType: string, tenantId: string, limit = 100): Promise<EventEnvelope[]> {
    const entities = await this.repo.find({
      where: { eventType, tenantId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
    return entities.map(e => this.toEnvelope(e));
  }

  private toEnvelope(entity: EventOrmEntity): EventEnvelope {
    return {
      event_id: entity.eventId,
      event_type: entity.eventType,
      tenant_id: entity.tenantId,
      correlation_id: entity.correlationId,
      timestamp: entity.timestamp.toISOString(),
      version: entity.version,
      payload: entity.payload,
    };
  }
}

@Injectable()
export class SchemaRegistryRepository implements ISchemaRegistry {
  constructor(
    @InjectRepository(EventSchemaOrmEntity)
    private readonly repo: Repository<EventSchemaOrmEntity>,
  ) {}

  async register(schema: EventSchema): Promise<void> {
    const entity = this.repo.create({
      eventType: schema.eventType,
      schema: schema.schema,
      version: schema.version,
    });
    await this.repo.save(entity);
  }

  async validate(_event: EventEnvelope): Promise<boolean> {
    // For Phase 0, basic validation — ensure required fields exist
    return !!(
      _event.event_id &&
      _event.event_type &&
      _event.tenant_id &&
      _event.correlation_id &&
      _event.timestamp &&
      _event.version !== undefined
    );
  }

  async getSchema(eventType: string): Promise<EventSchema | null> {
    const entity = await this.repo.findOne({ where: { eventType } });
    if (!entity) return null;
    return {
      eventType: entity.eventType,
      schema: entity.schema,
      version: entity.version,
    };
  }
}

@Injectable()
export class DlqRepository implements IDlqService {
  constructor(
    @InjectRepository(DlqOrmEntity)
    private readonly repo: Repository<DlqOrmEntity>,
  ) {}

  async enqueue(event: EventEnvelope, error: string, attempts: number): Promise<void> {
    const entity = this.repo.create({
      id: uuidv4(),
      event: event as unknown as Record<string, unknown>,
      error,
      attempts,
      processed: false,
    });
    await this.repo.save(entity);
  }

  async dequeue(limit = 10): Promise<Array<{ event: EventEnvelope; error: string; attempts: number }>> {
    const entities = await this.repo.find({
      where: { processed: false },
      order: { createdAt: 'ASC' },
      take: limit,
    });
    return entities.map(e => ({
      event: e.event as unknown as EventEnvelope,
      error: e.error,
      attempts: e.attempts,
    }));
  }
}
