import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { AttendanceRecord, AttendanceStatus, AttendanceSummary } from '../../domain/entities/attendance.entity';
import { IAttendanceRepository } from '../../domain/interfaces/attendance-repository.interface';
import { AttendanceEvents } from '../../domain/events/attendance.events';
import { IEventBus } from '../../../../shared/domain/interfaces/event-bus.interface';

export interface CheckInDto {
  tenantId: string;
  employeeId: string;
  location?: { lat: number; lng: number };
  ipAddress?: string;
}

export interface CheckOutDto {
  tenantId: string;
  employeeId: string;
}

@Injectable()
export class AttendanceService {
  constructor(
    @Inject('IAttendanceRepository')
    private readonly attendanceRepo: IAttendanceRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async checkIn(dto: CheckInDto): Promise<AttendanceRecord> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.attendanceRepo.findByEmployeeAndDate(dto.employeeId, today, dto.tenantId);
    if (existing && existing.checkIn) {
      throw new ConflictException('Already checked in today');
    }

    const now = new Date();
    const record = new AttendanceRecord({
      tenantId: dto.tenantId,
      employeeId: dto.employeeId,
      date: today,
      checkIn: now,
      status: AttendanceStatus.PRESENT,
      location: dto.location,
      ipAddress: dto.ipAddress,
    });

    // Check if late (after 09:00)
    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 0, 0, 0);
    if (now > lateThreshold) {
      record.status = AttendanceStatus.LATE;
    }

    const saved = await this.attendanceRepo.save(record);

    const eventType = record.status === AttendanceStatus.LATE
      ? AttendanceEvents.LATE_ARRIVAL
      : AttendanceEvents.CHECK_IN;

    await this.eventBus.publish({
      event_type: eventType,
      tenant_id: dto.tenantId,
      payload: { employeeId: dto.employeeId, checkIn: now, status: record.status },
      timestamp: now,
    });

    return saved;
  }

  async checkOut(dto: CheckOutDto): Promise<AttendanceRecord> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await this.attendanceRepo.findByEmployeeAndDate(dto.employeeId, today, dto.tenantId);
    if (!record) throw new NotFoundException('No check-in found for today');
    if (record.checkOut) throw new ConflictException('Already checked out today');

    const now = new Date();
    const workHours = record.checkIn ? (now.getTime() - record.checkIn.getTime()) / 3600000 : 0;
    const overtimeHours = Math.max(0, workHours - 8);

    await this.attendanceRepo.update(record.id, dto.tenantId, {
      checkOut: now,
      workHours: Math.round(workHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
    });

    // Check early departure (before 17:00)
    const earlyThreshold = new Date(today);
    earlyThreshold.setHours(17, 0, 0, 0);
    if (now < earlyThreshold) {
      await this.attendanceRepo.update(record.id, dto.tenantId, { status: AttendanceStatus.EARLY_LEAVE });
      await this.eventBus.publish({
        event_type: AttendanceEvents.EARLY_DEPARTURE,
        tenant_id: dto.tenantId,
        payload: { employeeId: dto.employeeId, checkOut: now },
        timestamp: now,
      });
    }

    await this.eventBus.publish({
      event_type: AttendanceEvents.CHECK_OUT,
      tenant_id: dto.tenantId,
      payload: { employeeId: dto.employeeId, checkOut: now, workHours: workHours },
      timestamp: now,
    });

    return (await this.attendanceRepo.findById(record.id, dto.tenantId))!;
  }

  async getByEmployee(employeeId: string, tenantId: string, startDate?: Date, endDate?: Date): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.findByEmployee(employeeId, tenantId, startDate, endDate);
  }

  async getByDate(date: Date, tenantId: string): Promise<AttendanceRecord[]> {
    return this.attendanceRepo.findByDate(date, tenantId);
  }

  async getSummary(employeeId: string, tenantId: string, month: number, year: number): Promise<AttendanceSummary> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const records = await this.attendanceRepo.findByEmployee(employeeId, tenantId, startDate, endDate);

    const summary = new AttendanceSummary({
      employeeId: employeeId,
      tenantId: tenantId,
      month,
      year,
      totalDays: endDate.getDate(),
      presentDays: records.filter(r => r.status === AttendanceStatus.PRESENT).length,
      absentDays: records.filter(r => r.status === AttendanceStatus.ABSENT).length,
      lateDays: records.filter(r => r.status === AttendanceStatus.LATE).length,
      leaveDays: records.filter(r => r.status === AttendanceStatus.ON_LEAVE).length,
      totalWorkHours: records.reduce((sum, r) => sum + (r.workHours || 0), 0),
      totalOvertimeHours: records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0),
    });

    return summary;
  }
}
