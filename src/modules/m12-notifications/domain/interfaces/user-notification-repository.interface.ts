import { UserNotification, NotificationSubscription } from '../entities/user-notification.entity';

export interface IUserNotificationRepository {
  save(notification: UserNotification): Promise<UserNotification>;
  findById(id: string, tenantId: string): Promise<UserNotification | null>;
  findByUser(userId: string, tenantId: string): Promise<UserNotification[]>;
  findUnread(userId: string, tenantId: string): Promise<UserNotification[]>;
  countUnread(userId: string, tenantId: string): Promise<number>;
  markAsRead(id: string, tenantId: string): Promise<void>;
  markAllAsRead(userId: string, tenantId: string): Promise<void>;
  archive(id: string, tenantId: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface INotificationSubscriptionRepository {
  save(subscription: NotificationSubscription): Promise<NotificationSubscription>;
  findByUser(userId: string, tenantId: string): Promise<NotificationSubscription[]>;
  findByEvent(eventType: string, tenantId: string): Promise<NotificationSubscription[]>;
  update(id: string, tenantId: string, updates: Partial<NotificationSubscription>): Promise<NotificationSubscription>;
  delete(id: string, tenantId: string): Promise<void>;
}
