export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  SECRET = 'secret',
}

export enum SettingScope {
  GLOBAL = 'global',
  TENANT = 'tenant',
  USER = 'user',
}

export interface Setting {
  id: string;
  tenantId: string;
  key: string;
  value: string;
  type: SettingType;
  scope: SettingScope;
  scopeId?: string;
  description?: string;
  isEncrypted: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingHistory {
  id: string;
  tenantId: string;
  settingId: string;
  previousValue: string;
  newValue: string;
  changedBy: string;
  changedAt: Date;
}
