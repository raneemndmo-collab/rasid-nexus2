import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserNotificationOrmEntity, NotificationSubscriptionOrmEntity } from './user-notification.orm-entity';
import { IUserNotificationRepository, INotificationSubscriptionRepository } from '../../../domain/interfaces/user-notification-repository.interface';
import { UserNotification, NotificationSubscription } from '../../../domain/entities/user-notification.entity';

@Injectable()
export class UserNotificationRepositoryImpl implements IUserNotificationRepository {
  constructor(@InjectRepository(UserNotificationOrmEntity) private readonly repo: Repository<UserNotificationOrmEntity>) {}

  async save(notification: UserNotification): Promise<UserNotification> {
    const entity = this.repo.create(notification as unknown as UserNotificationOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as UserNotification;
  }

  async findById(id: string, tenantId: string): Promise<UserNotification | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as UserNotification) : null;
  }

  async findByUser(userId: string, tenantId: string): Promise<UserNotification[]> {
    const entities = await this.repo.find({ where: { userId, tenantId }, order: { createdAt: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as UserNotification));
  }

  async findUnread(userId: string, tenantId: string): Promise<UserNotification[]> {
    const entities = await this.repo.find({ where: { userId, tenantId, status: 'unread' }, order: { createdAt: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as UserNotification));
  }

  async countUnread(userId: string, tenantId: string): Promise<number> {
    return this.repo.count({ where: { userId, tenantId, status: 'unread' } });
  }

  async markAsRead(id: string, tenantId: string): Promise<void> {
    await this.repo.update({ id, tenantId }, { status: 'read', readAt: new Date() });
  }

  async markAllAsRead(userId: string, tenantId: string): Promise<void> {
    await this.repo.update({ userId, tenantId, status: 'unread' }, { status: 'read', readAt: new Date() });
  }

  async archive(id: string, tenantId: string): Promise<void> {
    await this.repo.update({ id, tenantId }, { status: 'archived' });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class NotificationSubscriptionRepositoryImpl implements INotificationSubscriptionRepository {
  constructor(@InjectRepository(NotificationSubscriptionOrmEntity) private readonly repo: Repository<NotificationSubscriptionOrmEntity>) {}

  async save(subscription: NotificationSubscription): Promise<NotificationSubscription> {
    const entity = this.repo.create(subscription as unknown as NotificationSubscriptionOrmEntity);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as NotificationSubscription;
  }

  async findByUser(userId: string, tenantId: string): Promise<NotificationSubscription[]> {
    const entities = await this.repo.find({ where: { userId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as NotificationSubscription));
  }

  async findByEvent(eventType: string, tenantId: string): Promise<NotificationSubscription[]> {
    const entities = await this.repo.find({ where: { eventType, tenantId, enabled: true } });
    return entities.map(e => ({ ...e } as unknown as NotificationSubscription));
  }

  async update(id: string, tenantId: string, updates: Partial<NotificationSubscription>): Promise<NotificationSubscription> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as NotificationSubscription;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}
