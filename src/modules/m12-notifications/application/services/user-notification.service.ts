import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserNotificationRepository, INotificationSubscriptionRepository } from '../../domain/interfaces/user-notification-repository.interface';
import { UserNotification, UserNotificationStatus, NotificationPriority, NotificationSubscription } from '../../domain/entities/user-notification.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { USER_NOTIFICATION_EVENTS } from '../../domain/events/user-notification.events';
import * as crypto from 'crypto';

export interface SendNotificationDto {
  tenantId: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  priority?: NotificationPriority;
  sourceModule: string;
  sourceId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class UserNotificationService {
  constructor(
    @Inject('IUserNotificationRepository') private readonly notifRepo: IUserNotificationRepository,
    @Inject('INotificationSubscriptionRepository') private readonly subRepo: INotificationSubscriptionRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async send(dto: SendNotificationDto): Promise<UserNotification> {
    const notification: UserNotification = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      type: dto.type,
      priority: dto.priority || NotificationPriority.MEDIUM,
      status: UserNotificationStatus.UNREAD,
      sourceModule: dto.sourceModule,
      sourceId: dto.sourceId,
      actionUrl: dto.actionUrl,
      metadata: dto.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.notifRepo.save(notification);

    await this.eventBus.publish({
      event_type: USER_NOTIFICATION_EVENTS.NOTIFICATION_SENT,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { notificationId: saved.id, userId: dto.userId, type: dto.type },
    });

    return saved;
  }

  async getNotifications(userId: string, tenantId: string): Promise<UserNotification[]> {
    return this.notifRepo.findByUser(userId, tenantId);
  }

  async getUnread(userId: string, tenantId: string): Promise<UserNotification[]> {
    return this.notifRepo.findUnread(userId, tenantId);
  }

  async countUnread(userId: string, tenantId: string): Promise<number> {
    return this.notifRepo.countUnread(userId, tenantId);
  }

  async markAsRead(id: string, tenantId: string): Promise<void> {
    await this.notifRepo.markAsRead(id, tenantId);
    await this.eventBus.publish({
      event_type: USER_NOTIFICATION_EVENTS.NOTIFICATION_READ,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { notificationId: id },
    });
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    await this.notifRepo.markAllAsRead(userId, tenantId);
  }

  async archive(id: string, tenantId: string): Promise<void> {
    await this.notifRepo.archive(id, tenantId);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.notifRepo.delete(id, tenantId);
  }

  async subscribe(tenantId: string, userId: string, eventType: string, channel: string): Promise<NotificationSubscription> {
    return this.subRepo.save({
      id: crypto.randomUUID(),
      tenantId,
      userId,
      eventType,
      channel,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getSubscriptions(userId: string, tenantId: string): Promise<NotificationSubscription[]> {
    return this.subRepo.findByUser(userId, tenantId);
  }

  async toggleSubscription(id: string, tenantId: string, enabled: boolean): Promise<NotificationSubscription> {
    return this.subRepo.update(id, tenantId, { enabled });
  }
}
