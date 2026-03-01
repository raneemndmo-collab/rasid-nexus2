import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventOrmEntity, EventSchemaOrmEntity, DlqOrmEntity } from './infrastructure/persistence/repositories/event.orm-entity';
import { EventStoreRepository, SchemaRegistryRepository, DlqRepository } from './infrastructure/persistence/repositories/event-store.repository';
import { NatsEventBusService } from './infrastructure/messaging/nats-event-bus.service';
import { EventsController } from './presentation/controllers/events.controller';
import { EVENT_BUS } from '@shared/domain/interfaces/event-bus.interface';
import { EVENT_STORE, SCHEMA_REGISTRY, DLQ_SERVICE } from './domain/interfaces/event-store.interface';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EventOrmEntity, EventSchemaOrmEntity, DlqOrmEntity])],
  controllers: [EventsController],
  providers: [
    {
      provide: EVENT_STORE,
      useClass: EventStoreRepository,
    },
    {
      provide: SCHEMA_REGISTRY,
      useClass: SchemaRegistryRepository,
    },
    {
      provide: DLQ_SERVICE,
      useClass: DlqRepository,
    },
    {
      provide: EVENT_BUS,
      useClass: NatsEventBusService,
    },
  ],
  exports: [EVENT_BUS, EVENT_STORE, SCHEMA_REGISTRY, DLQ_SERVICE],
})
export class K5EventsModule {}
