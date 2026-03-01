export const CONFIG_REPOSITORY = Symbol('CONFIG_REPOSITORY');

export interface ConfigItem {
  id: string;
  tenantId: string;
  key: string;
  value: unknown;
  description?: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConfigRepository {
  get(tenantId: string, key: string): Promise<ConfigItem | null>;
  getAll(tenantId: string): Promise<ConfigItem[]>;
  set(tenantId: string, key: string, value: unknown, description?: string, type?: string): Promise<ConfigItem>;
  delete(tenantId: string, key: string): Promise<void>;
}
