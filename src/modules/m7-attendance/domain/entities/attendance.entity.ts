import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EARLY_LEAVE = 'early_leave',
  ON_LEAVE = 'on_leave',
  HOLIDAY = 'holiday',
}

export class AttendanceRecord extends BaseEntity {
  employeeId!: string;
  date!: Date;
  checkIn?: Date;
  checkOut?: Date;
  status!: AttendanceStatus;
  workHours?: number;
  overtimeHours?: number;
  notes?: string;
  location?: { lat: number; lng: number };
  ipAddress?: string;

  constructor(partial: Partial<AttendanceRecord>) {
    super();
    Object.assign(this, partial);
    this.status = this.status || AttendanceStatus.PRESENT;
  }
}

export class AttendanceSummary {
  employeeId!: string;
  tenantId!: string;
  month!: number;
  year!: number;
  totalDays!: number;
  presentDays!: number;
  absentDays!: number;
  lateDays!: number;
  leaveDays!: number;
  totalWorkHours!: number;
  totalOvertimeHours!: number;

  constructor(partial: Partial<AttendanceSummary>) {
    Object.assign(this, partial);
  }
}
