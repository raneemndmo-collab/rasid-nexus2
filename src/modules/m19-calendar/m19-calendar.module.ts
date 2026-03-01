import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEventEntity } from './infrastructure/persistence/repositories/calendar.orm-entity';
import { CalendarRepository } from './infrastructure/persistence/repositories/calendar.repository';
import { CalendarService } from './application/services/calendar.service';
import { CalendarController } from './presentation/controllers/calendar.controller';
import { CALENDAR_REPOSITORY } from './domain/interfaces/calendar-repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEventEntity])],
  controllers: [CalendarController],
  providers: [
    { provide: CALENDAR_REPOSITORY, useClass: CalendarRepository },
    CalendarService,
  ],
  exports: [CalendarService],
})
export class M19CalendarModule {}
