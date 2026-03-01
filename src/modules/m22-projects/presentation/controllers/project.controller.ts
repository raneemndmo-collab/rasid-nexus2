import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Delete, Param, Body, Headers } from '@nestjs/common';
import { ProjectService } from '../../application/services/project.service';

@ApiTags('projects')
@Controller('api/v1/projects')
export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  @Post()
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createProject({ ...body, tenantId });
  }
  @Get()
  list(@Headers('x-tenant-id') tenantId: string) { return this.service.listProjects(tenantId); }
  @Get(':id')
  get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getProject(tenantId, id); }
  @Put(':id')
  update(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: any) {
    return this.service.updateProject(tenantId, id, body);
  }
  @Put(':id/complete')
  complete(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.service.completeProject(tenantId, id);
  }
  @Post(':id/members')
  addMember(@Headers('x-tenant-id') tenantId: string, @Param('id') projectId: string, @Body() body: any) {
    return this.service.addMember({ ...body, tenantId, projectId });
  }
  @Get(':id/members')
  listMembers(@Headers('x-tenant-id') tenantId: string, @Param('id') projectId: string) {
    return this.service.listMembers(tenantId, projectId);
  }
  @Delete(':id/members/:userId')
  removeMember(@Headers('x-tenant-id') tenantId: string, @Param('id') projectId: string, @Param('userId') userId: string) {
    return this.service.removeMember(tenantId, projectId, userId);
  }
}
