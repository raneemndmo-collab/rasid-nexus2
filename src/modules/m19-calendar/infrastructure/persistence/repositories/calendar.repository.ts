import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { ICalendarRepository } from '../../../domain/interfaces/calendar-repository.interface';
import { CalendarEvent } from '../../../domain/entities/calendar.entity';
import { CalendarEventEntity } from './calendar.orm-entity';

@Injectable()
export class CalendarRepository implements ICalendarRepository {
  constructor(@InjectRepository(CalendarEventEntity) private readonly repo: Repository<CalendarEventEntity>) {}

  async create(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    return this.repo.save(this.repo.create(event)) as unknown as CalendarEvent;
  }
  async findById(tenantId: string, id: string): Promise<CalendarEvent | null> {
    return this.repo.findOne({ where: { tenantId, id } }) as unknown as CalendarEvent | null;
  }
  async list(tenantId: string, from?: Date, to?: Date): Promise<CalendarEvent[]> {
    const where: Record<string, unknown> = { tenantId };
    if (from && to) where.startTime = Between(from, to);
    else if (from) where.startTime = MoreThanOrEqual(from);
    else if (to) where.startTime = LessThanOrEqual(to);
    return this.repo.find({ where }) as unknown as CalendarEvent[];
  }
  async update(tenantId: string, id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    await this.repo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findById(tenantId, id) as unknown as CalendarEvent;
  }
  async delete(tenantId: string, id: string): Promise<void> {
    await this.repo.delete({ tenantId, id });
  }
}
