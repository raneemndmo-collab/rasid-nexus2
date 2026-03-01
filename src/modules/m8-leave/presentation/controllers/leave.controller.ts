import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { LeaveService, CreateLeaveRequestDto, ApproveLeaveDto, RejectLeaveDto, InitializeBalanceDto } from '../../application/services/leave.service';
import { LeaveType } from '../../domain/entities/leave.entity';

@ApiTags('m8-leave')
@Controller('m8/leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('requests')
  async createRequest(
    @Body() body: { employeeId: string; leaveType: LeaveType; startDate: string; endDate: string; reason: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: CreateLeaveRequestDto = {
      ...body,
      tenantId: tenantId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };
    return this.leaveService.createRequest(dto);
  }

  @Get('requests/pending')
  async getPending(@Headers('x-tenant-id') tenantId: string) {
    return this.leaveService.getPending(tenantId);
  }

  @Get('requests/employee/:employeeId')
  async getRequests(
    @Param('employeeId') employeeId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.leaveService.getRequests(employeeId, tenantId);
  }

  @Put('requests/:id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: { approvedBy: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: ApproveLeaveDto = { requestId: id, approvedBy: body.approvedBy, tenantId: tenantId };
    return this.leaveService.approve(dto);
  }

  @Put('requests/:id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: { approvedBy: string; rejectionReason: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: RejectLeaveDto = { requestId: id, ...body, tenantId: tenantId };
    return this.leaveService.reject(dto);
  }

  @Delete('requests/:id')
  async cancel(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    await this.leaveService.cancel(id, tenantId);
    return { message: 'Leave request cancelled' };
  }

  @Get('balance/:employeeId')
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Query('year') year: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.leaveService.getBalance(employeeId, parseInt(year) || new Date().getFullYear(), tenantId);
  }

  @Post('balance/initialize')
  async initializeBalance(
    @Body() body: { employeeId: string; year: number; balances: { leaveType: LeaveType; totalDays: number }[] },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: InitializeBalanceDto = { ...body, tenantId: tenantId };
    return this.leaveService.initializeBalance(dto);
  }
}
