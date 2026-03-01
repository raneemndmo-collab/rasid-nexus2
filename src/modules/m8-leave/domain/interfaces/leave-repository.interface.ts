import { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '../entities/leave.entity';

export interface ILeaveRequestRepository {
  save(request: LeaveRequest): Promise<LeaveRequest>;
  findById(id: string, tenantId: string): Promise<LeaveRequest | null>;
  findByEmployee(employeeId: string, tenantId: string): Promise<LeaveRequest[]>;
  findByStatus(status: LeaveStatus, tenantId: string): Promise<LeaveRequest[]>;
  findPendingByApprover(approverId: string, tenantId: string): Promise<LeaveRequest[]>;
  update(id: string, tenantId: string, data: Partial<LeaveRequest>): Promise<void>;
}

export interface ILeaveBalanceRepository {
  save(balance: LeaveBalance): Promise<LeaveBalance>;
  findByEmployee(employeeId: string, year: number, tenantId: string): Promise<LeaveBalance[]>;
  findByEmployeeAndType(employeeId: string, leaveType: LeaveType, year: number, tenantId: string): Promise<LeaveBalance | null>;
  update(id: string, tenantId: string, data: Partial<LeaveBalance>): Promise<void>;
  upsert(balance: LeaveBalance): Promise<LeaveBalance>;
}
