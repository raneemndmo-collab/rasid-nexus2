import { Controller, Post, Get, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MonitoringService, RecordMetricDto, CreateAlertRuleDto, RecordHealthCheckDto } from '../../application/services/monitoring.service';

@ApiTags('K9 Monitoring')
@Controller('api/k9/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Post('metrics')
  @ApiOperation({ summary: 'Record a metric' })
  async recordMetric(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<RecordMetricDto, 'tenantId'>) {
    return this.monitoringService.recordMetric({ ...body, tenantId });
  }

  @Get('metrics/:name')
  @ApiOperation({ summary: 'Get metrics by name' })
  async getMetrics(
    @Param('name') name: string,
    @Headers('x-tenant-id') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.monitoringService.getMetrics(name, tenantId, new Date(from), new Date(to));
  }

  @Post('alert-rules')
  @ApiOperation({ summary: 'Create an alert rule' })
  async createAlertRule(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<CreateAlertRuleDto, 'tenantId'>) {
    return this.monitoringService.createAlertRule({ ...body, tenantId });
  }

  @Get('alert-rules')
  @ApiOperation({ summary: 'List alert rules' })
  async getAlertRules(@Headers('x-tenant-id') tenantId: string) {
    return this.monitoringService.getAlertRules(tenantId);
  }

  @Get('alerts/active')
  @ApiOperation({ summary: 'Get active alerts' })
  async getActiveAlerts(@Headers('x-tenant-id') tenantId: string) {
    return this.monitoringService.getActiveAlerts(tenantId);
  }

  @Patch('alerts/:id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge an alert' })
  async acknowledgeAlert(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { userId: string },
  ) {
    return this.monitoringService.acknowledgeAlert(id, tenantId, body.userId);
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  async resolveAlert(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    return this.monitoringService.resolveAlert(id, tenantId);
  }

  @Post('health-checks')
  @ApiOperation({ summary: 'Record a health check' })
  async recordHealthCheck(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<RecordHealthCheckDto, 'tenantId'>) {
    return this.monitoringService.recordHealthCheck({ ...body, tenantId });
  }

  @Get('health-checks')
  @ApiOperation({ summary: 'Get health checks' })
  async getHealthChecks(@Headers('x-tenant-id') tenantId: string) {
    return this.monitoringService.getHealthChecks(tenantId);
  }
}
