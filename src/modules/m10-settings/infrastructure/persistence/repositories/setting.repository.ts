import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingOrmEntity, SettingHistoryOrmEntity } from './setting.orm-entity';
import { ISettingRepository, ISettingHistoryRepository } from '../../../domain/interfaces/setting-repository.interface';
import { Setting, SettingHistory } from '../../../domain/entities/setting.entity';

@Injectable()
export class SettingRepositoryImpl implements ISettingRepository {
  constructor(
    @InjectRepository(SettingOrmEntity)
    private readonly repo: Repository<SettingOrmEntity>,
  ) {}

  async save(setting: Setting): Promise<Setting> {
    const entity = this.repo.create(setting);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as Setting;
  }

  async findById(id: string, tenantId: string): Promise<Setting | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as Setting) : null;
  }

  async findByKey(key: string, tenantId: string, scope?: string, scopeId?: string): Promise<Setting | null> {
    const where: Record<string, unknown> = { key, tenantId };
    if (scope) where['scope'] = scope;
    if (scopeId) where['scopeId'] = scopeId;
    const entity = await this.repo.findOne({ where });
    return entity ? ({ ...entity } as unknown as Setting) : null;
  }

  async findAll(tenantId: string): Promise<Setting[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as Setting));
  }

  async findByScope(tenantId: string, scope: string, scopeId?: string): Promise<Setting[]> {
    const where: Record<string, unknown> = { tenantId, scope };
    if (scopeId) where['scopeId'] = scopeId;
    const entities = await this.repo.find({ where });
    return entities.map(e => ({ ...e } as unknown as Setting));
  }

  async update(id: string, tenantId: string, updates: Partial<Setting>): Promise<Setting> {
    await this.repo.update({ id, tenantId }, updates as Record<string, unknown>);
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return { ...entity } as unknown as Setting;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class SettingHistoryRepositoryImpl implements ISettingHistoryRepository {
  constructor(
    @InjectRepository(SettingHistoryOrmEntity)
    private readonly repo: Repository<SettingHistoryOrmEntity>,
  ) {}

  async save(history: SettingHistory): Promise<SettingHistory> {
    const entity = this.repo.create(history);
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as SettingHistory;
  }

  async findBySetting(settingId: string, tenantId: string): Promise<SettingHistory[]> {
    const entities = await this.repo.find({ where: { settingId, tenantId }, order: { changedAt: 'DESC' } });
    return entities.map(e => ({ ...e } as unknown as SettingHistory));
  }
}
