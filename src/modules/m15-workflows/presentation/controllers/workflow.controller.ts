import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { WorkflowService } from '../../application/services/workflow.service';

@ApiTags('workflows')
@Controller('api/v1/workflows')
export class WorkflowController {
  constructor(private readonly service: WorkflowService) {}

  @Post('definitions')
  createDefinition(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createDefinition({ ...body, tenantId });
  }

  @Get('definitions')
  listDefinitions(@Headers('x-tenant-id') tenantId: string, @Query('status') status?: string) {
    return this.service.listDefinitions(tenantId, status);
  }

  @Get('definitions/:id')
  getDefinition(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.getDefinition(tenantId, id);
  }

  @Put('definitions/:id')
  updateDefinition(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    return this.service.updateDefinition(tenantId, id, body);
  }

  @Put('definitions/:id/activate')
  activateDefinition(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.activateDefinition(tenantId, id);
  }

  @Delete('definitions/:id')
  deleteDefinition(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.updateDefinition(tenantId, id, { status: 'archived' } as any);
  }

  @Post('executions')
  startExecution(@Headers('x-tenant-id') tenantId: string, @Body() body: { definitionId: string; context?: Record<string, unknown> }) {
    return this.service.startExecution(tenantId, body.definitionId, body.context);
  }

  @Get('executions')
  listExecutions(@Headers('x-tenant-id') tenantId: string, @Query('definitionId') definitionId?: string) {
    return this.service.listExecutions(tenantId, definitionId);
  }

  @Get('executions/:id')
  getExecution(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.getExecution(tenantId, id);
  }

  @Get('executions/:id/logs')
  getStepLogs(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.getStepLogs(tenantId, id);
  }
}
