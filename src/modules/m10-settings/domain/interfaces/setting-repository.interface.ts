import { Setting, SettingHistory } from '../entities/setting.entity';

export interface ISettingRepository {
  save(setting: Setting): Promise<Setting>;
  findById(id: string, tenantId: string): Promise<Setting | null>;
  findByKey(key: string, tenantId: string, scope?: string, scopeId?: string): Promise<Setting | null>;
  findAll(tenantId: string): Promise<Setting[]>;
  findByScope(tenantId: string, scope: string, scopeId?: string): Promise<Setting[]>;
  update(id: string, tenantId: string, updates: Partial<Setting>): Promise<Setting>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface ISettingHistoryRepository {
  save(history: SettingHistory): Promise<SettingHistory>;
  findBySetting(settingId: string, tenantId: string): Promise<SettingHistory[]>;
}
