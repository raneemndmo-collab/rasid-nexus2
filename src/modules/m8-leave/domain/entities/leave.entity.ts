import { BaseEntity } from '../../../../shared/domain/entities/base.entity';

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  UNPAID = 'unpaid',
  EMERGENCY = 'emergency',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class LeaveRequest extends BaseEntity {
  employeeId!: string;
  leaveType!: LeaveType;
  startDate!: Date;
  endDate!: Date;
  days!: number;
  reason!: string;
  status!: LeaveStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  constructor(partial: Partial<LeaveRequest>) {
    super();
    Object.assign(this, partial);
    this.status = this.status || LeaveStatus.PENDING;
  }
}

export class LeaveBalance extends BaseEntity {
  employeeId!: string;
  leaveType!: LeaveType;
  year!: number;
  totalDays!: number;
  usedDays!: number;
  remainingDays!: number;

  constructor(partial: Partial<LeaveBalance>) {
    super();
    Object.assign(this, partial);
    this.remainingDays = this.totalDays - this.usedDays;
  }
}
