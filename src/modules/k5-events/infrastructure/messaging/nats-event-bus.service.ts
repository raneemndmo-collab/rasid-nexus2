import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JetStreamClient, JetStreamManager, StringCodec } from 'nats';
import { EventEnvelope } from '@shared/domain/events/event-envelope';
import { IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { EVENT_STORE, IEventStore, SCHEMA_REGISTRY, ISchemaRegistry, DLQ_SERVICE, IDlqService } from '../../domain/interfaces/event-store.interface';

const MAX_RETRY = 3;

@Injectable()
export class NatsEventBusService implements IEventBus, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NatsEventBusService.name);
  private connection!: NatsConnection;
  private jetstream!: JetStreamClient;
  private jsm!: JetStreamManager;
  private readonly sc = StringCodec();
  private readonly processedEvents = new Set<string>();
  private readonly handlers = new Map<string, Array<(event: EventEnvelope) => Promise<void>>>();

  constructor(
    private readonly config: ConfigService,
    @Inject(EVENT_STORE) private readonly eventStore: IEventStore,
    @Inject(SCHEMA_REGISTRY) private readonly schemaRegistry: ISchemaRegistry,
    @Inject(DLQ_SERVICE) private readonly dlqService: IDlqService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const natsUrl = this.config.get<string>('NATS_URL', 'nats://localhost:4222');
      this.connection = await connect({ servers: natsUrl });
      this.jsm = await this.connection.jetstreamManager();
      this.jetstream = this.connection.jetstream();

      // Create streams for Phase 0 topics
      const streams = ['auth', 'tenant', 'audit', 'config', 'events'];
      for (const stream of streams) {
        try {
          await this.jsm.streams.add({
            name: stream,
            subjects: [`${stream}.*`, `${stream}.>`],
          });
        } catch {
          // Stream may already exist
        }
      }

      this.logger.log('NATS JetStream connected and streams initialized');
    } catch (error) {
      this.logger.warn('NATS connection failed, using in-memory event bus fallback');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connection) {
      await this.connection.drain();
    }
  }

  async publish(event: EventEnvelope): Promise<void> {
    // Validate schema
    const isValid = await this.schemaRegistry.validate(event);
    if (!isValid) {
      this.logger.warn(`Event schema validation failed for ${event.event_type}`);
      // For Phase 0, we allow events without registered schemas but log the warning
    }

    // Store event
    await this.eventStore.store(event);

    // Publish to NATS if connected
    if (this.jetstream) {
      try {
        const subject = event.event_type.replace(/\./g, '.');
        await this.jetstream.publish(subject, this.sc.encode(JSON.stringify(event)));
      } catch (error) {
        this.logger.error(`Failed to publish event ${event.event_id} to NATS`, error);
      }
    }

    // Process local handlers
    const handlers = this.handlers.get(event.event_type) || [];
    for (const handler of handlers) {
      await this.executeWithRetry(event, handler);
    }
  }

  async subscribe(eventType: string, handler: (event: EventEnvelope) => Promise<void>): Promise<void> {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  private async executeWithRetry(event: EventEnvelope, handler: (event: EventEnvelope) => Promise<void>): Promise<void> {
    // Idempotency check
    if (this.processedEvents.has(event.event_id)) {
      return;
    }

    let attempts = 0;
    while (attempts < MAX_RETRY) {
      try {
        await handler(event);
        this.processedEvents.add(event.event_id);
        return;
      } catch (error) {
        attempts++;
        if (attempts >= MAX_RETRY) {
          await this.dlqService.enqueue(event, String(error), attempts);
          this.logger.error(`Event ${event.event_id} moved to DLQ after ${MAX_RETRY} attempts`);
        }
      }
    }
  }
}
