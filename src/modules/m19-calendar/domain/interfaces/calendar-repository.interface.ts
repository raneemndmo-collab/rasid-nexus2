import { CalendarEvent } from '../entities/calendar.entity';

export interface ICalendarRepository {
  create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent>;
  findById(tenantId: string, id: string): Promise<CalendarEvent | null>;
  list(tenantId: string, from?: Date, to?: Date): Promise<CalendarEvent[]>;
  update(tenantId: string, id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  delete(tenantId: string, id: string): Promise<void>;
}

export const CALENDAR_REPOSITORY = Symbol('ICalendarRepository');
