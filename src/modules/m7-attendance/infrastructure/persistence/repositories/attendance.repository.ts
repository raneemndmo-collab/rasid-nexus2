import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceOrmEntity } from './attendance.orm-entity';
import { IAttendanceRepository } from '../../../domain/interfaces/attendance-repository.interface';
import { AttendanceRecord } from '../../../domain/entities/attendance.entity';

@Injectable()
export class AttendanceRepositoryImpl implements IAttendanceRepository {
  constructor(
    @InjectRepository(AttendanceOrmEntity)
    private readonly repo: Repository<AttendanceOrmEntity>,
  ) {}

  async save(record: AttendanceRecord): Promise<AttendanceRecord> {
    const entity = this.repo.create({
      tenantId: record.tenantId,
      employeeId: record.employeeId,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      workHours: record.workHours,
      overtimeHours: record.overtimeHours,
      notes: record.notes,
      location: record.location,
      ipAddress: record.ipAddress,
    });
    const saved = await this.repo.save(entity);
    return new AttendanceRecord({ ...saved } as Partial<AttendanceRecord>);
  }

  async findById(id: string, tenantId: string): Promise<AttendanceRecord | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId: tenantId } });
    return entity ? new AttendanceRecord({ ...entity } as Partial<AttendanceRecord>) : null;
  }

  async findByEmployeeAndDate(employeeId: string, date: Date, tenantId: string): Promise<AttendanceRecord | null> {
    const entity = await this.repo.findOne({ where: { employeeId: employeeId, date, tenantId: tenantId } });
    return entity ? new AttendanceRecord({ ...entity } as Partial<AttendanceRecord>) : null;
  }

  async findByEmployee(employeeId: string, tenantId: string, startDate?: Date, endDate?: Date): Promise<AttendanceRecord[]> {
    const where: Record<string, unknown> = { employeeId: employeeId, tenantId: tenantId };
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }
    const entities = await this.repo.find({ where, order: { date: 'DESC' } });
    return entities.map(e => new AttendanceRecord({ ...e } as Partial<AttendanceRecord>));
  }

  async findByDate(date: Date, tenantId: string): Promise<AttendanceRecord[]> {
    const entities = await this.repo.find({ where: { date, tenantId: tenantId } });
    return entities.map(e => new AttendanceRecord({ ...e } as Partial<AttendanceRecord>));
  }

  async update(id: string, tid: string, data: Partial<AttendanceRecord>): Promise<void> {
    const { tenantId: _unused, ...updateData } = data;
    await this.repo.update({ id, tenantId: tid }, updateData as Record<string, unknown>);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId: tenantId });
  }
}
