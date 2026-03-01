import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '../../domain/entities/leave.entity';
import { ILeaveRequestRepository, ILeaveBalanceRepository } from '../../domain/interfaces/leave-repository.interface';
import { LeaveEvents } from '../../domain/events/leave.events';
import { IEventBus } from '../../../../shared/domain/interfaces/event-bus.interface';

export interface CreateLeaveRequestDto {
  tenantId: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export interface ApproveLeaveDto {
  tenantId: string;
  requestId: string;
  approvedBy: string;
}

export interface RejectLeaveDto {
  tenantId: string;
  requestId: string;
  approvedBy: string;
  rejectionReason: string;
}

export interface InitializeBalanceDto {
  tenantId: string;
  employeeId: string;
  year: number;
  balances: { leaveType: LeaveType; totalDays: number }[];
}

@Injectable()
export class LeaveService {
  constructor(
    @Inject('ILeaveRequestRepository')
    private readonly requestRepo: ILeaveRequestRepository,
    @Inject('ILeaveBalanceRepository')
    private readonly balanceRepo: ILeaveBalanceRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
  ) {}

  async createRequest(dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const days = this.calculateDays(dto.startDate, dto.endDate);
    if (days <= 0) throw new BadRequestException('End date must be after start date');

    // Check balance
    const balance = await this.balanceRepo.findByEmployeeAndType(
      dto.employeeId, dto.leaveType, dto.startDate.getFullYear(), dto.tenantId,
    );

    if (balance && balance.remainingDays < days) {
      throw new BadRequestException(`Insufficient leave balance. Available: ${balance.remainingDays}, Requested: ${days}`);
    }

    const request = new LeaveRequest({
      tenantId: dto.tenantId,
      employeeId: dto.employeeId,
      leaveType: dto.leaveType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      days,
      reason: dto.reason,
    });

    const saved = await this.requestRepo.save(request);

    await this.eventBus.publish({
      event_type: LeaveEvents.LEAVE_REQUESTED,
      tenant_id: dto.tenantId,
      payload: { requestId: saved.id, employeeId: dto.employeeId, leaveType: dto.leaveType, days },
      timestamp: new Date(),
    });

    return saved;
  }

  async approve(dto: ApproveLeaveDto): Promise<LeaveRequest> {
    const request = await this.requestRepo.findById(dto.requestId, dto.tenantId);
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveStatus.PENDING) throw new BadRequestException('Request is not pending');

    await this.requestRepo.update(dto.requestId, dto.tenantId, {
      status: LeaveStatus.APPROVED,
      approvedBy: dto.approvedBy,
      approvedAt: new Date(),
    });

    // Deduct from balance
    const balance = await this.balanceRepo.findByEmployeeAndType(
      request.employeeId, request.leaveType as LeaveType, request.startDate.getFullYear(), dto.tenantId,
    );

    if (balance) {
      const newUsed = Number(balance.usedDays) + request.days;
      await this.balanceRepo.update(balance.id, dto.tenantId, {
        usedDays: newUsed,
        remainingDays: Number(balance.totalDays) - newUsed,
      });

      await this.eventBus.publish({
        event_type: LeaveEvents.BALANCE_UPDATED,
        tenant_id: dto.tenantId,
        payload: { employeeId: request.employeeId, leaveType: request.leaveType, usedDays: newUsed },
        timestamp: new Date(),
      });
    }

    await this.eventBus.publish({
      event_type: LeaveEvents.LEAVE_APPROVED,
      tenant_id: dto.tenantId,
      payload: { requestId: dto.requestId, approvedBy: dto.approvedBy },
      timestamp: new Date(),
    });

    return (await this.requestRepo.findById(dto.requestId, dto.tenantId))!;
  }

  async reject(dto: RejectLeaveDto): Promise<LeaveRequest> {
    const request = await this.requestRepo.findById(dto.requestId, dto.tenantId);
    if (!request) throw new NotFoundException('Leave request not found');
    if (request.status !== LeaveStatus.PENDING) throw new BadRequestException('Request is not pending');

    await this.requestRepo.update(dto.requestId, dto.tenantId, {
      status: LeaveStatus.REJECTED,
      approvedBy: dto.approvedBy,
      rejectionReason: dto.rejectionReason,
    });

    await this.eventBus.publish({
      event_type: LeaveEvents.LEAVE_REJECTED,
      tenant_id: dto.tenantId,
      payload: { requestId: dto.requestId, reason: dto.rejectionReason },
      timestamp: new Date(),
    });

    return (await this.requestRepo.findById(dto.requestId, dto.tenantId))!;
  }

  async cancel(requestId: string, tenantId: string): Promise<void> {
    const request = await this.requestRepo.findById(requestId, tenantId);
    if (!request) throw new NotFoundException('Leave request not found');

    // Restore balance if was approved
    if (request.status === LeaveStatus.APPROVED) {
      const balance = await this.balanceRepo.findByEmployeeAndType(
        request.employeeId, request.leaveType as LeaveType, request.startDate.getFullYear(), tenantId,
      );
      if (balance) {
        const newUsed = Math.max(0, Number(balance.usedDays) - request.days);
        await this.balanceRepo.update(balance.id, tenantId, {
          usedDays: newUsed,
          remainingDays: Number(balance.totalDays) - newUsed,
        });
      }
    }

    await this.requestRepo.update(requestId, tenantId, { status: LeaveStatus.CANCELLED });

    await this.eventBus.publish({
      event_type: LeaveEvents.LEAVE_CANCELLED,
      tenant_id: tenantId,
      payload: { requestId: requestId },
      timestamp: new Date(),
    });
  }

  async getRequests(employeeId: string, tenantId: string): Promise<LeaveRequest[]> {
    return this.requestRepo.findByEmployee(employeeId, tenantId);
  }

  async getPending(tenantId: string): Promise<LeaveRequest[]> {
    return this.requestRepo.findByStatus(LeaveStatus.PENDING, tenantId);
  }

  async getBalance(employeeId: string, year: number, tenantId: string): Promise<LeaveBalance[]> {
    return this.balanceRepo.findByEmployee(employeeId, year, tenantId);
  }

  async initializeBalance(dto: InitializeBalanceDto): Promise<LeaveBalance[]> {
    const results: LeaveBalance[] = [];
    for (const b of dto.balances) {
      const balance = new LeaveBalance({
        tenantId: dto.tenantId,
        employeeId: dto.employeeId,
        leaveType: b.leaveType,
        year: dto.year,
        totalDays: b.totalDays,
        usedDays: 0,
        remainingDays: b.totalDays,
      });
      const saved = await this.balanceRepo.upsert(balance);
      results.push(saved);
    }

    await this.eventBus.publish({
      event_type: LeaveEvents.BALANCE_INITIALIZED,
      tenant_id: dto.tenantId,
      payload: { employeeId: dto.employeeId, year: dto.year },
      timestamp: new Date(),
    });

    return results;
  }

  private calculateDays(start: Date, end: Date): number {
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
