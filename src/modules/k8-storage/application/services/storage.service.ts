import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IStorageRepository, IStorageQuotaRepository, IObjectStore } from '../../domain/interfaces/storage-repository.interface';
import { StoredObject, StorageStatus } from '../../domain/entities/storage.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { STORAGE_EVENTS } from '../../domain/events/storage.events';
import * as crypto from 'crypto';

export interface UploadDto {
  tenantId: string;
  bucket: string;
  originalName: string;
  mimeType: string;
  data: Buffer;
  encrypted?: boolean;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
}

export interface DownloadResult {
  data: Buffer;
  object: StoredObject;
}

@Injectable()
export class StorageService {
  constructor(
    @Inject('IStorageRepository') private readonly storageRepo: IStorageRepository,
    @Inject('IStorageQuotaRepository') private readonly quotaRepo: IStorageQuotaRepository,
    @Inject('IObjectStore') private readonly objectStore: IObjectStore,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async upload(dto: UploadDto): Promise<StoredObject> {
    const quota = await this.quotaRepo.findByTenant(dto.tenantId);
    if (quota) {
      if (Number(quota.usedBytes) + dto.data.length > Number(quota.maxBytes)) {
        await this.eventBus.publish({
          event_type: STORAGE_EVENTS.QUOTA_EXCEEDED,
          tenant_id: dto.tenantId,
          timestamp: new Date(),
          payload: { usedBytes: quota.usedBytes, maxBytes: quota.maxBytes },
        });
        throw new BadRequestException('Storage quota exceeded');
      }
    }

    const key = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}-${dto.originalName}`;
    const encrypted = dto.encrypted !== false;
    const { checksum } = await this.objectStore.put(dto.bucket, key, dto.data, encrypted);

    const obj: StoredObject = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      bucket: dto.bucket,
      key,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
      size: dto.data.length,
      checksum,
      encrypted,
      status: StorageStatus.ACTIVE,
      metadata: dto.metadata,
      expiresAt: dto.expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.storageRepo.save(obj);
    await this.quotaRepo.incrementUsage(dto.tenantId, dto.data.length, 1);

    await this.eventBus.publish({
      event_type: STORAGE_EVENTS.OBJECT_UPLOADED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { objectId: saved.id, key, size: dto.data.length },
    });

    return saved;
  }

  async download(id: string, tenantId: string): Promise<DownloadResult> {
    const obj = await this.storageRepo.findById(id, tenantId);
    if (!obj) throw new BadRequestException('Object not found');
    if (obj.status !== StorageStatus.ACTIVE) throw new BadRequestException('Object not available');

    const data = await this.objectStore.get(obj.bucket, obj.key);

    await this.eventBus.publish({
      event_type: STORAGE_EVENTS.OBJECT_DOWNLOADED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { objectId: id },
    });

    return { data, object: obj };
  }

  async deleteObject(id: string, tenantId: string): Promise<void> {
    const obj = await this.storageRepo.findById(id, tenantId);
    if (!obj) throw new BadRequestException('Object not found');

    await this.objectStore.delete(obj.bucket, obj.key);
    await this.storageRepo.updateStatus(id, tenantId, StorageStatus.DELETED);
    await this.quotaRepo.decrementUsage(tenantId, obj.size, 1);

    await this.eventBus.publish({
      event_type: STORAGE_EVENTS.OBJECT_DELETED,
      tenant_id: tenantId,
      timestamp: new Date(),
      payload: { objectId: id },
    });
  }

  async listObjects(tenantId: string): Promise<StoredObject[]> {
    return this.storageRepo.findAll(tenantId);
  }

  async getQuota(tenantId: string) {
    return this.quotaRepo.findByTenant(tenantId);
  }
}
