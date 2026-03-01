export enum StorageStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
  QUARANTINED = 'quarantined',
}

export interface StoredObject {
  id: string;
  tenantId: string;
  bucket: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  checksum: string;
  encrypted: boolean;
  encryptionKeyId?: string;
  status: StorageStatus;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageQuota {
  id: string;
  tenantId: string;
  maxBytes: number;
  usedBytes: number;
  maxObjects: number;
  usedObjects: number;
  createdAt: Date;
  updatedAt: Date;
}
