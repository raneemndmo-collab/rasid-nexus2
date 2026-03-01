import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Param, Body, Query, Headers } from '@nestjs/common';
import { TaskService } from '../../application/services/task.service';

@ApiTags('tasks')
@Controller('api/v1/tasks')
export class TaskController {
  constructor(private readonly service: TaskService) {}

  @Post()
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createTask({ ...body, tenantId });
  }
  @Get()
  list(@Headers('x-tenant-id') tenantId: string, @Query('status') status?: string, @Query('assigneeId') assigneeId?: string, @Query('projectId') projectId?: string) {
    return this.service.listTasks(tenantId, { status, assigneeId, projectId });
  }
  @Get(':id')
  get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getTask(tenantId, id); }
  @Put(':id')
  update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    return this.service.updateTask(tenantId, id, body);
  }
  @Put(':id/assign')
  assign(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: { assigneeId: string }) {
    return this.service.assignTask(tenantId, id, body.assigneeId);
  }
  @Put(':id/complete')
  complete(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.completeTask(tenantId, id);
  }
  @Post(':id/comments')
  addComment(@Headers('x-tenant-id') tenantId: string, @Param('id') taskId: string, @Body() body: any) {
    return this.service.addComment({ ...body, tenantId, taskId });
  }
  @Get(':id/comments')
  listComments(@Headers('x-tenant-id') tenantId: string, @Param('id') taskId: string) {
    return this.service.listComments(tenantId, taskId);
  }
}
