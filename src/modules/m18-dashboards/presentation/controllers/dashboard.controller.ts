import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Param, Body, Headers } from '@nestjs/common';
import { DashboardService } from '../../application/services/dashboard.service';

@ApiTags('dashboards')
@Controller('api/v1/dashboards')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Post()
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createDashboard({ ...body, tenantId });
  }
  @Get()
  list(@Headers('x-tenant-id') tenantId: string) { return this.service.listDashboards(tenantId); }
  @Get(':id')
  get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getDashboard(tenantId, id); }
  @Put(':id')
  update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    return this.service.updateDashboard(tenantId, id, body);
  }
  @Post(':id/widgets')
  addWidget(@Headers('x-tenant-id') tenantId: string, @Param('id') dashboardId: string, @Body() body: any) {
    return this.service.addWidget({ ...body, tenantId, dashboardId });
  }
  @Get(':id/widgets')
  listWidgets(@Headers('x-tenant-id') tenantId: string, @Param('id') dashboardId: string) {
    return this.service.listWidgets(tenantId, dashboardId);
  }
  @Post(':id/ai-insight')
  aiInsight(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.generateAIInsight(tenantId, id);
  }
}
