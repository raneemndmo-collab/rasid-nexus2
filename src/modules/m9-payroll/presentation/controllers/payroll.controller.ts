import { Controller, Post, Get, Put, Param, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PayrollService, CalculatePayrollDto } from '../../application/services/payroll.service';

@ApiTags('M9 Payroll')
@Controller('api/m9/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate payroll for a period' })
  async calculate(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<CalculatePayrollDto, 'tenantId'>) {
    return this.payrollService.calculatePayroll({ ...body, tenantId });
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Approve payroll run' })
  async approve(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.payrollService.approvePayroll(id, tenantId, approvedBy);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute payroll (pay employees)' })
  async execute(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.payrollService.executePayroll(id, tenantId);
  }

  @Get('runs')
  @ApiOperation({ summary: 'List all payroll runs' })
  async listRuns(@Headers('x-tenant-id') tenantId: string) {
    return this.payrollService.listPayrollRuns(tenantId);
  }

  @Get('runs/:id')
  @ApiOperation({ summary: 'Get payroll run details' })
  async getRun(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.payrollService.getPayrollRun(id, tenantId);
  }

  @Get('payslips/:id')
  @ApiOperation({ summary: 'Get payslip by ID' })
  async getPayslip(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.payrollService.getPayslip(id, tenantId);
  }

  @Get('payslips/employee/:employeeId')
  @ApiOperation({ summary: 'Get employee payslips' })
  async getEmployeePayslips(@Param('employeeId') employeeId: string, @Headers('x-tenant-id') tenantId: string) {
    return this.payrollService.getEmployeePayslips(employeeId, tenantId);
  }

  @Get('structures')
  @ApiOperation({ summary: 'List salary structures' })
  async listStructures(@Headers('x-tenant-id') tenantId: string) {
    return this.payrollService.getSalaryStructures(tenantId);
  }

  @Post('structures')
  @ApiOperation({ summary: 'Create salary structure' })
  async createStructure(@Headers('x-tenant-id') tenantId: string, @Body() body: { name: string; components: unknown[]; isDefault?: boolean }) {
    return this.payrollService.createSalaryStructure(tenantId, body as any);
  }
}
