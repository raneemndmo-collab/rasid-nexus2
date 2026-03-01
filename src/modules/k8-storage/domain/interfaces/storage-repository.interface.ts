import { StoredObject, StorageQuota } from '../entities/storage.entity';

export interface IStorageRepository {
  save(obj: StoredObject): Promise<StoredObject>;
  findById(id: string, tenantId: string): Promise<StoredObject | null>;
  findByKey(bucket: string, key: string, tenantId: string): Promise<StoredObject | null>;
  findAll(tenantId: string): Promise<StoredObject[]>;
  updateStatus(id: string, tenantId: string, status: string): Promise<void>;
  delete(id: string, tenantId: string): Promise<void>;
}

export interface IStorageQuotaRepository {
  findByTenant(tenantId: string): Promise<StorageQuota | null>;
  upsert(quota: StorageQuota): Promise<StorageQuota>;
  incrementUsage(tenantId: string, bytes: number, objects: number): Promise<void>;
  decrementUsage(tenantId: string, bytes: number, objects: number): Promise<void>;
}

export interface IObjectStore {
  put(bucket: string, key: string, data: Buffer, encrypted: boolean): Promise<{ checksum: string }>;
  get(bucket: string, key: string): Promise<Buffer>;
  delete(bucket: string, key: string): Promise<void>;
  exists(bucket: string, key: string): Promise<boolean>;
}
