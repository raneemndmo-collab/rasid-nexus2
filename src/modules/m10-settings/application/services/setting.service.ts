import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ISettingRepository, ISettingHistoryRepository } from '../../domain/interfaces/setting-repository.interface';
import { Setting, SettingType, SettingScope, SettingHistory } from '../../domain/entities/setting.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { SETTING_EVENTS } from '../../domain/events/setting.events';
import * as crypto from 'crypto';

export interface CreateSettingDto {
  tenantId: string;
  key: string;
  value: string;
  type?: SettingType;
  scope?: SettingScope;
  scopeId?: string;
  description?: string;
  isEncrypted?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateSettingDto {
  value: string;
  changedBy: string;
}

@Injectable()
export class SettingService {
  constructor(
    @Inject('ISettingRepository') private readonly settingRepo: ISettingRepository,
    @Inject('ISettingHistoryRepository') private readonly historyRepo: ISettingHistoryRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async create(dto: CreateSettingDto): Promise<Setting> {
    const existing = await this.settingRepo.findByKey(dto.key, dto.tenantId, dto.scope, dto.scopeId);
    if (existing) throw new ConflictException(`Setting "${dto.key}" already exists`);

    const setting: Setting = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      key: dto.key,
      value: dto.value,
      type: dto.type || SettingType.STRING,
      scope: dto.scope || SettingScope.TENANT,
      scopeId: dto.scopeId,
      description: dto.description,
      isEncrypted: dto.isEncrypted || false,
      metadata: dto.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.settingRepo.save(setting);

    await this.eventBus.publish({
      event_type: SETTING_EVENTS.SETTING_CREATED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { settingId: saved.id, key: dto.key },
    });

    return saved;
  }

  async get(key: string, tenantId: string, scope?: string, scopeId?: string): Promise<Setting | null> {
    return this.settingRepo.findByKey(key, tenantId, scope, scopeId);
  }

  async getById(id: string, tenantId: string): Promise<Setting> {
    const setting = await this.settingRepo.findById(id, tenantId);
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async list(tenantId: string): Promise<Setting[]> {
    return this.settingRepo.findAll(tenantId);
  }

  async listByScope(tenantId: string, scope: string, scopeId?: string): Promise<Setting[]> {
    return this.settingRepo.findByScope(tenantId, scope, scopeId);
  }

  async update(id: string, tenantId: string, dto: UpdateSettingDto): Promise<Setting> {
    const existing = await this.settingRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Setting not found');

    const history: SettingHistory = {
      id: crypto.randomUUID(),
      tenantId,
      settingId: id,
      previousValue: existing.value,
      newValue: dto.value,
      changedBy: dto.changedBy,
      changedAt: new Date(),
    };
    await this.historyRepo.save(history);

    const updated = await this.settingRepo.update(id, tenantId, { value: dto.value });

    await this.eventBus.publish({
      event_type: SETTING_EVENTS.SETTING_UPDATED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { settingId: id, key: existing.key },
    });

    return updated;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const existing = await this.settingRepo.findById(id, tenantId);
    if (!existing) throw new NotFoundException('Setting not found');

    await this.settingRepo.delete(id, tenantId);

    await this.eventBus.publish({
      event_type: SETTING_EVENTS.SETTING_DELETED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { settingId: id, key: existing.key },
    });
  }

  async getHistory(settingId: string, tenantId: string): Promise<SettingHistory[]> {
    return this.historyRepo.findBySetting(settingId, tenantId);
  }
}
