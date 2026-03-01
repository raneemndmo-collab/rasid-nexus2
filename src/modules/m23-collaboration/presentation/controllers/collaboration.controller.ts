import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Param, Body, Query, Headers } from '@nestjs/common';
import { CollaborationService } from '../../application/services/collaboration.service';

@ApiTags('collaboration')
@Controller('api/v1/collaboration')
export class CollaborationController {
  constructor(private readonly service: CollaborationService) {}

  @Post('sessions')
  create(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createSession({ ...body, tenantId });
  }
  @Get('sessions')
  list(@Headers('x-tenant-id') tenantId: string) { return this.service.listSessions(tenantId); }
  @Get('sessions/:id')
  get(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getSession(tenantId, id); }
  @Put('sessions/:id/end')
  end(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.endSession(tenantId, id); }

  @Post('sessions/:id/changes')
  applyChange(@Headers('x-tenant-id') tenantId: string, @Param('id') sessionId: string, @Body() body: any) {
    return this.service.applyChange({ ...body, tenantId, sessionId });
  }
  @Get('sessions/:id/changes')
  getChanges(@Headers('x-tenant-id') tenantId: string, @Param('id') sessionId: string, @Query('sinceVersion') sinceVersion?: string) {
    return this.service.getChanges(tenantId, sessionId, sinceVersion ? parseInt(sinceVersion) : undefined);
  }

  @Post('sessions/:id/join')
  join(@Headers('x-tenant-id') tenantId: string, @Param('id') sessionId: string, @Body() body: { userId: string }) {
    return this.service.joinSession(tenantId, sessionId, body.userId);
  }
  @Post('sessions/:id/leave')
  leave(@Headers('x-tenant-id') tenantId: string, @Param('id') sessionId: string, @Body() body: { userId: string }) {
    return this.service.leaveSession(tenantId, sessionId, body.userId);
  }
  @Get('sessions/:id/presence')
  presence(@Headers('x-tenant-id') tenantId: string, @Param('id') sessionId: string) {
    return this.service.getPresence(tenantId, sessionId);
  }
}
