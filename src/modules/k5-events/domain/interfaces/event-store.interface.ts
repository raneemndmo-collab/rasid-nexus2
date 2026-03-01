import { EventEnvelope } from '@shared/domain/events/event-envelope';

export const EVENT_STORE = Symbol('EVENT_STORE');

export interface EventSchema {
  eventType: string;
  schema: Record<string, unknown>;
  version: number;
}

export interface IEventStore {
  store(event: EventEnvelope): Promise<void>;
  getById(eventId: string): Promise<EventEnvelope | null>;
  getByCorrelation(correlationId: string): Promise<EventEnvelope[]>;
  getByType(eventType: string, tenantId: string, limit?: number): Promise<EventEnvelope[]>;
}

export const SCHEMA_REGISTRY = Symbol('SCHEMA_REGISTRY');

export interface ISchemaRegistry {
  register(schema: EventSchema): Promise<void>;
  validate(event: EventEnvelope): Promise<boolean>;
  getSchema(eventType: string): Promise<EventSchema | null>;
}

export const DLQ_SERVICE = Symbol('DLQ_SERVICE');

export interface IDlqService {
  enqueue(event: EventEnvelope, error: string, attempts: number): Promise<void>;
  dequeue(limit?: number): Promise<Array<{ event: EventEnvelope; error: string; attempts: number }>>;
}
