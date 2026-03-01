import { Controller, Post, Get, Body, Param, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { EVENT_STORE, IEventStore, DLQ_SERVICE, IDlqService } from '../../domain/interfaces/event-store.interface';
import { EventEnvelope } from '@shared/domain/events/event-envelope';
import { GetTenantId } from '@shared/presentation/decorators/tenant.decorator';

@ApiTags('Events (K5)')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(EVENT_STORE) private readonly eventStore: IEventStore,
    @Inject(DLQ_SERVICE) private readonly dlqService: IDlqService,
  ) {}

  @Post('publish')
  @ApiOperation({ summary: 'Publish an event' })
  async publish(@Body() event: EventEnvelope) {
    await this.eventBus.publish(event);
    return { status: 'published', event_id: event.event_id };
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Get event by ID' })
  async getById(@Param('eventId') eventId: string) {
    return this.eventStore.getById(eventId);
  }

  @Get('correlation/:correlationId')
  @ApiOperation({ summary: 'Get events by correlation ID' })
  async getByCorrelation(@Param('correlationId') correlationId: string) {
    return this.eventStore.getByCorrelation(correlationId);
  }

  @Get('type/:eventType')
  @ApiOperation({ summary: 'Get events by type' })
  async getByType(
    @Param('eventType') eventType: string,
    @GetTenantId() tenantId: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventStore.getByType(eventType, tenantId, limit ? parseInt(limit, 10) : undefined);
  }

  @Get('dlq/list')
  @ApiOperation({ summary: 'List dead letter queue entries' })
  async getDlq(@Query('limit') limit?: string) {
    return this.dlqService.dequeue(limit ? parseInt(limit, 10) : undefined);
  }
}
