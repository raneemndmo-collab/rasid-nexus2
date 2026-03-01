import { Injectable, Inject } from '@nestjs/common';
import { ICalendarRepository, CALENDAR_REPOSITORY } from '../../domain/interfaces/calendar-repository.interface';
import { CalendarEvent } from '../../domain/entities/calendar.entity';
import { CalendarEvents } from '../../domain/events/calendar.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

@Injectable()
export class CalendarService {
  constructor(
    @Inject(CALENDAR_REPOSITORY) private readonly repo: ICalendarRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createEvent(data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const event = await this.repo.create(data);
    await this.eventBus.publish({ event_type: CalendarEvents.EVENT_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: event });
    return event;
  }
  async getEvent(tenantId: string, id: string) { return this.repo.findById(tenantId, id); }
  async listEvents(tenantId: string, from?: Date, to?: Date) { return this.repo.list(tenantId, from, to); }
  async updateEvent(tenantId: string, id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const event = await this.repo.update(tenantId, id, updates);
    await this.eventBus.publish({ event_type: CalendarEvents.EVENT_UPDATED, tenant_id: tenantId, timestamp: new Date(), payload: event });
    return event;
  }
  async cancelEvent(tenantId: string, id: string): Promise<CalendarEvent> {
    const event = await this.repo.update(tenantId, id, { status: 'cancelled' } as Partial<CalendarEvent>);
    await this.eventBus.publish({ event_type: CalendarEvents.EVENT_CANCELLED, tenant_id: tenantId, timestamp: new Date(), payload: event });
    return event;
  }
}
