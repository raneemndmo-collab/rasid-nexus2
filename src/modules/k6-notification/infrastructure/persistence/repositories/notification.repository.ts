import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationOrmEntity, NotificationTemplateOrmEntity, NotificationPreferenceOrmEntity } from './notification.orm-entity';
import { INotificationRepository, INotificationTemplateRepository, INotificationPreferenceRepository } from '../../../domain/interfaces/notification-repository.interface';
import { NotificationEntity, NotificationTemplate, NotificationPreference, NotificationChannel } from '../../../domain/entities/notification.entity';

@Injectable()
export class NotificationRepositoryImpl implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repo: Repository<NotificationOrmEntity>,
  ) {}

  async save(notification: NotificationEntity): Promise<NotificationEntity> {
    const entity = this.repo.create({
      tenantId: notification.tenantId,
      recipientId: notification.recipientId,
      channel: notification.channel,
      templateId: notification.templateId,
      subject: notification.subject,
      body: notification.body,
      status: notification.status,
      metadata: notification.metadata,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as NotificationEntity;
  }

  async findById(id: string, tenantId: string): Promise<NotificationEntity | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as NotificationEntity) : null;
  }

  async findByRecipient(recipientId: string, tenantId: string): Promise<NotificationEntity[]> {
    const entities = await this.repo.find({ where: { recipientId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as NotificationEntity));
  }

  async updateStatus(id: string, tenantId: string, status: string, error?: string): Promise<void> {
    const updateData: Record<string, unknown> = { status };
    if (status === 'sent') updateData.sentAt = new Date();
    if (status === 'delivered') updateData.deliveredAt = new Date();
    if (error) updateData.error = error;
    await this.repo.update({ id, tenantId }, updateData);
  }
}

@Injectable()
export class NotificationTemplateRepositoryImpl implements INotificationTemplateRepository {
  constructor(
    @InjectRepository(NotificationTemplateOrmEntity)
    private readonly repo: Repository<NotificationTemplateOrmEntity>,
  ) {}

  async save(template: NotificationTemplate): Promise<NotificationTemplate> {
    const entity = this.repo.create({
      tenantId: template.tenantId,
      name: template.name,
      channel: template.channel,
      subjectTemplate: template.subjectTemplate,
      bodyTemplate: template.bodyTemplate,
      variables: template.variables,
      isActive: template.isActive,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as NotificationTemplate;
  }

  async findById(id: string, tenantId: string): Promise<NotificationTemplate | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as NotificationTemplate) : null;
  }

  async findByName(name: string, channel: NotificationChannel, tenantId: string): Promise<NotificationTemplate | null> {
    const entity = await this.repo.findOne({ where: { name, channel, tenantId } });
    return entity ? ({ ...entity } as unknown as NotificationTemplate) : null;
  }

  async findAll(tenantId: string): Promise<NotificationTemplate[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as NotificationTemplate));
  }
}

@Injectable()
export class NotificationPreferenceRepositoryImpl implements INotificationPreferenceRepository {
  constructor(
    @InjectRepository(NotificationPreferenceOrmEntity)
    private readonly repo: Repository<NotificationPreferenceOrmEntity>,
  ) {}

  async save(preference: NotificationPreference): Promise<NotificationPreference> {
    const entity = this.repo.create({
      tenantId: preference.tenantId,
      userId: preference.userId,
      channel: preference.channel,
      enabled: preference.enabled,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as NotificationPreference;
  }

  async findByUser(userId: string, tenantId: string): Promise<NotificationPreference[]> {
    const entities = await this.repo.find({ where: { userId, tenantId } });
    return entities.map(e => ({ ...e } as unknown as NotificationPreference));
  }

  async findByUserAndChannel(userId: string, channel: NotificationChannel, tenantId: string): Promise<NotificationPreference | null> {
    const entity = await this.repo.findOne({ where: { userId, channel, tenantId } });
    return entity ? ({ ...entity } as unknown as NotificationPreference) : null;
  }

  async upsert(preference: NotificationPreference): Promise<NotificationPreference> {
    const existing = await this.findByUserAndChannel(preference.userId, preference.channel, preference.tenantId);
    if (existing) {
      await this.repo.update({ id: existing.id }, { enabled: preference.enabled });
      return { ...existing, enabled: preference.enabled };
    }
    return this.save(preference);
  }
}
