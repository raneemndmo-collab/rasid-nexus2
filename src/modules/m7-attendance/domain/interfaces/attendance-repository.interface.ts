import { AttendanceRecord } from '../entities/attendance.entity';

export interface IAttendanceRepository {
  save(record: AttendanceRecord): Promise<AttendanceRecord>;
  findById(id: string, tenantId: string): Promise<AttendanceRecord | null>;
  findByEmployeeAndDate(employeeId: string, date: Date, tenantId: string): Promise<AttendanceRecord | null>;
  findByEmployee(employeeId: string, tenantId: string, startDate?: Date, endDate?: Date): Promise<AttendanceRecord[]>;
  findByDate(date: Date, tenantId: string): Promise<AttendanceRecord[]>;
  update(id: string, tenantId: string, data: Partial<AttendanceRecord>): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}
