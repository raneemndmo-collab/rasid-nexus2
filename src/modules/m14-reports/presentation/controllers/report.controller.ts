import { Controller, Post, Get, Put, Delete, Param, Body, Query, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReportService, CreateReportDefinitionDto, ExecuteReportDto, ScheduleReportDto } from '../../application/services/report.service';

@ApiTags('M14 Reports')
@Controller('api/m14/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post('definitions')
  @ApiOperation({ summary: 'Create report definition' })
  async createDefinition(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<CreateReportDefinitionDto, 'tenantId'>) {
    return this.reportService.createDefinition({ ...body, tenantId });
  }

  @Get('definitions')
  @ApiOperation({ summary: 'List report definitions' })
  async listDefinitions(@Headers('x-tenant-id') tenantId: string) {
    return this.reportService.listDefinitions(tenantId);
  }

  @Get('definitions/module/:module')
  @ApiOperation({ summary: 'List report definitions by module' })
  async listByModule(@Param('module') module: string, @Headers('x-tenant-id') tenantId: string) {
    return this.reportService.listByModule(module, tenantId);
  }

  @Get('definitions/:id')
  @ApiOperation({ summary: 'Get report definition' })
  async getDefinition(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.reportService.getDefinition(id, tenantId);
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute a report' })
  async execute(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<ExecuteReportDto, 'tenantId'>) {
    return this.reportService.executeReport({ ...body, tenantId });
  }

  @Get('executions')
  @ApiOperation({ summary: 'List report executions' })
  async listExecutions(@Headers('x-tenant-id') tenantId: string) {
    return this.reportService.listExecutions(tenantId);
  }

  @Get('executions/:id')
  @ApiOperation({ summary: 'Get report execution' })
  async getExecution(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.reportService.getExecution(id, tenantId);
  }

  @Post('schedules')
  @ApiOperation({ summary: 'Schedule a report' })
  async schedule(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<ScheduleReportDto, 'tenantId'>) {
    return this.reportService.scheduleReport({ ...body, tenantId });
  }

  @Get('schedules')
  @ApiOperation({ summary: 'List scheduled reports' })
  async listSchedules(@Headers('x-tenant-id') tenantId: string) {
    return this.reportService.listSchedules(tenantId);
  }

  @Put('schedules/:id/toggle')
  @ApiOperation({ summary: 'Enable/disable scheduled report' })
  async toggleSchedule(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.reportService.toggleSchedule(id, tenantId, enabled);
  }

  @Delete('schedules/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete scheduled report' })
  async deleteSchedule(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.reportService.deleteSchedule(id, tenantId);
  }
}
