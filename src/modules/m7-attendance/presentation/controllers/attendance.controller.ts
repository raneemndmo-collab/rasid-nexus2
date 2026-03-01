import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Body, Param, Query, Headers } from '@nestjs/common';
import { AttendanceService, CheckInDto, CheckOutDto } from '../../application/services/attendance.service';

@ApiTags('m7-attendance')
@Controller('m7/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(
    @Body() body: { employeeId: string; location?: { lat: number; lng: number }; ipAddress?: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: CheckInDto = { ...body, tenantId: tenantId };
    return this.attendanceService.checkIn(dto);
  }

  @Post('check-out')
  async checkOut(
    @Body() body: { employeeId: string },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: CheckOutDto = { ...body, tenantId: tenantId };
    return this.attendanceService.checkOut(dto);
  }

  @Get('employee/:employeeId')
  async getByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.getByEmployee(
      employeeId,
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('date/:date')
  async getByDate(
    @Param('date') date: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.getByDate(new Date(date), tenantId);
  }

  @Get('summary/:employeeId')
  async getSummary(
    @Param('employeeId') employeeId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.attendanceService.getSummary(employeeId, tenantId, parseInt(month), parseInt(year));
  }
}
