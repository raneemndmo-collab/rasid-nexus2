import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Put, Param, Body, Headers } from '@nestjs/common';
import { MessageService } from '../../application/services/message.service';

@ApiTags('messages')
@Controller('api/v1/messages')
export class MessageController {
  constructor(private readonly service: MessageService) {}

  @Post('threads')
  createThread(@Headers('x-tenant-id') tenantId: string, @Body() body: any) {
    return this.service.createThread({ ...body, tenantId });
  }
  @Get('threads')
  listThreads(@Headers('x-tenant-id') tenantId: string) { return this.service.listThreads(tenantId); }
  @Get('threads/:id')
  getThread(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) { return this.service.getThread(tenantId, id); }
  @Post('threads/:id/messages')
  send(@Headers('x-tenant-id') tenantId: string, @Param('id') threadId: string, @Body() body: any) {
    return this.service.sendMessage({ ...body, tenantId, threadId });
  }
  @Get('threads/:id/messages')
  listMessages(@Headers('x-tenant-id') tenantId: string, @Param('id') threadId: string) {
    return this.service.listMessages(tenantId, threadId);
  }
  @Put(':id/read')
  markRead(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() body: { userId: string }) {
    return this.service.markAsRead(tenantId, id, body.userId);
  }
}
