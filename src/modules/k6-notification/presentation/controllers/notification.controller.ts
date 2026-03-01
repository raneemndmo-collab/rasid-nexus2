import { ApiTags } from '@nestjs/swagger';
import { Controller, Post, Get, Put, Body, Param, Headers } from '@nestjs/common';
import { NotificationService, SendNotificationDto, UpdatePreferenceDto } from '../../application/services/notification.service';
import { NotificationChannel } from '../../domain/entities/notification.entity';

@ApiTags('k6-notification')
@Controller('k6/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  async send(
    @Body() body: { recipientId: string; channel: NotificationChannel; templateName: string; variables: Record<string, string>; metadata?: Record<string, unknown> },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: SendNotificationDto = { ...body, tenantId };
    return this.notificationService.send(dto);
  }

  @Get(':recipientId')
  async getNotifications(
    @Param('recipientId') recipientId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.notificationService.getNotifications(recipientId, tenantId);
  }

  @Put('preferences')
  async updatePreference(
    @Body() body: { userId: string; channel: NotificationChannel; enabled: boolean },
    @Headers('x-tenant-id') tenantId: string,
  ) {
    const dto: UpdatePreferenceDto = { ...body, tenantId };
    return this.notificationService.updatePreference(dto);
  }

  @Get('preferences/:userId')
  async getPreferences(
    @Param('userId') userId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    return this.notificationService.getPreferences(userId, tenantId);
  }
}
