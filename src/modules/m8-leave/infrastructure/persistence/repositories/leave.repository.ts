import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequestOrmEntity, LeaveBalanceOrmEntity } from './leave.orm-entity';
import { ILeaveRequestRepository, ILeaveBalanceRepository } from '../../../domain/interfaces/leave-repository.interface';
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '../../../domain/entities/leave.entity';

@Injectable()
export class LeaveRequestRepositoryImpl implements ILeaveRequestRepository {
  constructor(
    @InjectRepository(LeaveRequestOrmEntity)
    private readonly repo: Repository<LeaveRequestOrmEntity>,
  ) {}

  async save(request: LeaveRequest): Promise<LeaveRequest> {
    const entity = this.repo.create({
      tenantId: request.tenantId,
      employeeId: request.employeeId,
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.days,
      reason: request.reason,
      status: request.status,
    });
    const saved = await this.repo.save(entity);
    return new LeaveRequest({ ...saved } as Partial<LeaveRequest>);
  }

  async findById(id: string, tid: string): Promise<LeaveRequest | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId: tid } });
    return entity ? new LeaveRequest({ ...entity } as Partial<LeaveRequest>) : null;
  }

  async findByEmployee(employeeId: string, tid: string): Promise<LeaveRequest[]> {
    const entities = await this.repo.find({ where: { employeeId, tenantId: tid }, order: { createdAt: 'DESC' } });
    return entities.map(e => new LeaveRequest({ ...e } as Partial<LeaveRequest>));
  }

  async findByStatus(status: LeaveStatus, tid: string): Promise<LeaveRequest[]> {
    const entities = await this.repo.find({ where: { status, tenantId: tid }, order: { createdAt: 'DESC' } });
    return entities.map(e => new LeaveRequest({ ...e } as Partial<LeaveRequest>));
  }

  async findPendingByApprover(approverId: string, tid: string): Promise<LeaveRequest[]> {
    const entities = await this.repo.find({ where: { status: LeaveStatus.PENDING, tenantId: tid }, order: { createdAt: 'ASC' } });
    return entities.map(e => new LeaveRequest({ ...e } as Partial<LeaveRequest>));
  }

  async update(id: string, tid: string, data: Partial<LeaveRequest>): Promise<void> {
    const { tenantId: _unused, ...updateData } = data;
    await this.repo.update({ id, tenantId: tid }, updateData as Record<string, unknown>);
  }
}

@Injectable()
export class LeaveBalanceRepositoryImpl implements ILeaveBalanceRepository {
  constructor(
    @InjectRepository(LeaveBalanceOrmEntity)
    private readonly repo: Repository<LeaveBalanceOrmEntity>,
  ) {}

  async save(balance: LeaveBalance): Promise<LeaveBalance> {
    const entity = this.repo.create({
      tenantId: balance.tenantId,
      employeeId: balance.employeeId,
      leaveType: balance.leaveType,
      year: balance.year,
      totalDays: balance.totalDays,
      usedDays: balance.usedDays,
      remainingDays: balance.remainingDays,
    });
    const saved = await this.repo.save(entity);
    return new LeaveBalance({ ...saved } as Partial<LeaveBalance>);
  }

  async findByEmployee(employeeId: string, year: number, tid: string): Promise<LeaveBalance[]> {
    const entities = await this.repo.find({ where: { employeeId, year, tenantId: tid } });
    return entities.map(e => new LeaveBalance({ ...e } as Partial<LeaveBalance>));
  }

  async findByEmployeeAndType(employeeId: string, leaveType: LeaveType, year: number, tid: string): Promise<LeaveBalance | null> {
    const entity = await this.repo.findOne({ where: { employeeId, leaveType, year, tenantId: tid } });
    return entity ? new LeaveBalance({ ...entity } as Partial<LeaveBalance>) : null;
  }

  async update(id: string, tid: string, data: Partial<LeaveBalance>): Promise<void> {
    const { tenantId: _unused, ...updateData } = data;
    await this.repo.update({ id, tenantId: tid }, updateData as Record<string, unknown>);
  }

  async upsert(balance: LeaveBalance): Promise<LeaveBalance> {
    const existing = await this.findByEmployeeAndType(balance.employeeId, balance.leaveType, balance.year, balance.tenantId);
    if (existing) {
      await this.update(existing.id, balance.tenantId, {
        totalDays: balance.totalDays,
        usedDays: balance.usedDays,
        remainingDays: balance.totalDays - balance.usedDays,
      });
      return new LeaveBalance({ ...existing, ...balance, remainingDays: balance.totalDays - balance.usedDays });
    }
    return this.save(balance);
  }
}
