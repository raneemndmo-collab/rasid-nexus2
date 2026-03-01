import { Injectable, Inject, Logger } from '@nestjs/common';
import { NotificationEntity, NotificationChannel, NotificationStatus, NotificationPreference } from '../../domain/entities/notification.entity';
import { INotificationRepository, INotificationTemplateRepository, INotificationPreferenceRepository, IChannelDispatcher } from '../../domain/interfaces/notification-repository.interface';
import { TemplateEngineService } from './template-engine.service';
import { NotificationEvents } from '../../domain/events/notification.events';
import { IEventBus } from '../../../../shared/domain/interfaces/event-bus.interface';

export interface SendNotificationDto {
  tenantId: string;
  recipientId: string;
  channel: NotificationChannel;
  templateName: string;
  variables: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface UpdatePreferenceDto {
  tenantId: string;
  userId: string;
  channel: NotificationChannel;
  enabled: boolean;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly dispatchers: Map<NotificationChannel, IChannelDispatcher>;

  constructor(
    @Inject('INotificationRepository')
    private readonly notificationRepo: INotificationRepository,
    @Inject('INotificationTemplateRepository')
    private readonly templateRepo: INotificationTemplateRepository,
    @Inject('INotificationPreferenceRepository')
    private readonly preferenceRepo: INotificationPreferenceRepository,
    @Inject('IEventBus')
    private readonly eventBus: IEventBus,
    private readonly templateEngine: TemplateEngineService,
    @Inject('CHANNEL_DISPATCHERS')
    dispatchers: IChannelDispatcher[],
  ) {
    this.dispatchers = new Map(dispatchers.map(d => [d.channel, d]));
  }

  async send(dto: SendNotificationDto): Promise<NotificationEntity> {
    const preference = await this.preferenceRepo.findByUserAndChannel(
      dto.recipientId, dto.channel, dto.tenantId,
    );

    if (preference && !preference.enabled) {
      this.logger.log(`User ${dto.recipientId} opted out of ${dto.channel}`);
      const optedOut: Partial<NotificationEntity> = {
        tenantId: dto.tenantId,
        recipientId: dto.recipientId,
        channel: dto.channel,
        templateId: 'opted-out',
        body: '',
        status: NotificationStatus.OPTED_OUT,
      };
      const saved = await this.notificationRepo.save(optedOut as NotificationEntity);
      await this.eventBus.publish({
        event_type: NotificationEvents.NOTIFICATION_OPTED_OUT,
        tenant_id: dto.tenantId,
        payload: { notificationId: saved.id, channel: dto.channel },
        timestamp: new Date(),
      });
      return saved;
    }

    const template = await this.templateRepo.findByName(dto.templateName, dto.channel, dto.tenantId);
    if (!template) {
      throw new Error(`Template '${dto.templateName}' not found for channel ${dto.channel}`);
    }

    const body = this.templateEngine.render(template.bodyTemplate, dto.variables);
    const subject = template.subjectTemplate
      ? this.templateEngine.render(template.subjectTemplate, dto.variables)
      : undefined;

    const notification: Partial<NotificationEntity> = {
      tenantId: dto.tenantId,
      recipientId: dto.recipientId,
      channel: dto.channel,
      templateId: template.id,
      subject,
      body,
      status: NotificationStatus.PENDING,
      metadata: dto.metadata,
    };

    const saved = await this.notificationRepo.save(notification as NotificationEntity);

    const dispatcher = this.dispatchers.get(dto.channel);
    if (!dispatcher) {
      await this.notificationRepo.updateStatus(saved.id, dto.tenantId, NotificationStatus.FAILED, `No dispatcher for ${dto.channel}`);
      throw new Error(`No dispatcher for channel ${dto.channel}`);
    }

    const result = await dispatcher.dispatch(saved);

    if (result.success) {
      await this.notificationRepo.updateStatus(saved.id, dto.tenantId, NotificationStatus.SENT);
      await this.eventBus.publish({
        event_type: NotificationEvents.NOTIFICATION_SENT,
        tenant_id: dto.tenantId,
        payload: { notificationId: saved.id, channel: dto.channel },
        timestamp: new Date(),
      });
    } else {
      await this.notificationRepo.updateStatus(saved.id, dto.tenantId, NotificationStatus.FAILED, result.error);
      await this.eventBus.publish({
        event_type: NotificationEvents.NOTIFICATION_FAILED,
        tenant_id: dto.tenantId,
        payload: { notificationId: saved.id, channel: dto.channel, error: result.error },
        timestamp: new Date(),
      });
    }

    return saved;
  }

  async updatePreference(dto: UpdatePreferenceDto): Promise<NotificationPreference> {
    const preference: Partial<NotificationPreference> = {
      tenantId: dto.tenantId,
      userId: dto.userId,
      channel: dto.channel,
      enabled: dto.enabled,
    };
    const saved = await this.preferenceRepo.upsert(preference as NotificationPreference);
    await this.eventBus.publish({
      event_type: NotificationEvents.PREFERENCE_UPDATED,
      tenant_id: dto.tenantId,
      payload: { userId: dto.userId, channel: dto.channel, enabled: dto.enabled },
      timestamp: new Date(),
    });
    return saved;
  }

  async getNotifications(recipientId: string, tenantId: string): Promise<NotificationEntity[]> {
    return this.notificationRepo.findByRecipient(recipientId, tenantId);
  }

  async getPreferences(userId: string, tenantId: string): Promise<NotificationPreference[]> {
    return this.preferenceRepo.findByUser(userId, tenantId);
  }
}
