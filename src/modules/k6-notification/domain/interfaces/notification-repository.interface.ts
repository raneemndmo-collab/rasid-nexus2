import { NotificationEntity, NotificationTemplate, NotificationPreference, NotificationChannel } from '../entities/notification.entity';

export interface INotificationRepository {
  save(notification: NotificationEntity): Promise<NotificationEntity>;
  findById(id: string, tenantId: string): Promise<NotificationEntity | null>;
  findByRecipient(recipientId: string, tenantId: string): Promise<NotificationEntity[]>;
  updateStatus(id: string, tenantId: string, status: string, error?: string): Promise<void>;
}

export interface INotificationTemplateRepository {
  save(template: NotificationTemplate): Promise<NotificationTemplate>;
  findById(id: string, tenantId: string): Promise<NotificationTemplate | null>;
  findByName(name: string, channel: NotificationChannel, tenantId: string): Promise<NotificationTemplate | null>;
  findAll(tenantId: string): Promise<NotificationTemplate[]>;
}

export interface INotificationPreferenceRepository {
  save(preference: NotificationPreference): Promise<NotificationPreference>;
  findByUser(userId: string, tenantId: string): Promise<NotificationPreference[]>;
  findByUserAndChannel(userId: string, channel: NotificationChannel, tenantId: string): Promise<NotificationPreference | null>;
  upsert(preference: NotificationPreference): Promise<NotificationPreference>;
}

export interface IChannelDispatcher {
  channel: NotificationChannel;
  dispatch(notification: NotificationEntity): Promise<{ success: boolean; error?: string }>;
}
