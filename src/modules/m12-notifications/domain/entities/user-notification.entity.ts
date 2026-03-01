export enum UserNotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface UserNotification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  priority: NotificationPriority;
  status: UserNotificationStatus;
  sourceModule: string;
  sourceId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSubscription {
  id: string;
  tenantId: string;
  userId: string;
  eventType: string;
  channel: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
