import { Controller, Post, Get, Put, Delete, Param, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserNotificationService, SendNotificationDto } from '../../application/services/user-notification.service';

@ApiTags('M12 User Notifications')
@Controller('api/m12/notifications')
export class UserNotificationController {
  constructor(private readonly notifService: UserNotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification' })
  async send(@Headers('x-tenant-id') tenantId: string, @Body() body: Omit<SendNotificationDto, 'tenantId'>) {
    return this.notifService.send({ ...body, tenantId });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user notifications' })
  async getByUser(@Param('userId') userId: string, @Headers('x-tenant-id') tenantId: string) {
    return this.notifService.getNotifications(userId, tenantId);
  }

  @Get('user/:userId/unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnread(@Param('userId') userId: string, @Headers('x-tenant-id') tenantId: string) {
    return this.notifService.getUnread(userId, tenantId);
  }

  @Get('user/:userId/unread/count')
  @ApiOperation({ summary: 'Count unread notifications' })
  async countUnread(@Param('userId') userId: string, @Headers('x-tenant-id') tenantId: string) {
    const count = await this.notifService.countUnread(userId, tenantId);
    return { count };
  }

  @Put(':id/read')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.notifService.markAsRead(id, tenantId);
  }

  @Put('user/:userId/read-all')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Param('userId') userId: string, @Headers('x-tenant-id') tenantId: string) {
    await this.notifService.markAllAsRead(userId, tenantId);
  }

  @Put(':id/archive')
  @HttpCode(204)
  @ApiOperation({ summary: 'Archive notification' })
  async archive(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.notifService.archive(id, tenantId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete notification' })
  async delete(@Param('id') id: string, @Headers('x-tenant-id') tenantId: string) {
    await this.notifService.delete(id, tenantId);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Subscribe to event notifications' })
  async subscribe(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { userId: string; eventType: string; channel: string },
  ) {
    return this.notifService.subscribe(tenantId, body.userId, body.eventType, body.channel);
  }

  @Get('subscriptions/:userId')
  @ApiOperation({ summary: 'Get user subscriptions' })
  async getSubscriptions(@Param('userId') userId: string, @Headers('x-tenant-id') tenantId: string) {
    return this.notifService.getSubscriptions(userId, tenantId);
  }
}
