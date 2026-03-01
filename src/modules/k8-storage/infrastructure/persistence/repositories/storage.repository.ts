import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredObjectOrmEntity, StorageQuotaOrmEntity } from './storage.orm-entity';
import { IStorageRepository, IStorageQuotaRepository } from '../../../domain/interfaces/storage-repository.interface';
import { StoredObject, StorageQuota } from '../../../domain/entities/storage.entity';

@Injectable()
export class StorageRepositoryImpl implements IStorageRepository {
  constructor(
    @InjectRepository(StoredObjectOrmEntity)
    private readonly repo: Repository<StoredObjectOrmEntity>,
  ) {}

  async save(obj: StoredObject): Promise<StoredObject> {
    const entity = this.repo.create({
      tenantId: obj.tenantId,
      bucket: obj.bucket,
      key: obj.key,
      originalName: obj.originalName,
      mimeType: obj.mimeType,
      size: obj.size,
      checksum: obj.checksum,
      encrypted: obj.encrypted,
      encryptionKeyId: obj.encryptionKeyId,
      status: obj.status,
      metadata: obj.metadata,
      expiresAt: obj.expiresAt,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as StoredObject;
  }

  async findById(id: string, tenantId: string): Promise<StoredObject | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? ({ ...entity } as unknown as StoredObject) : null;
  }

  async findByKey(bucket: string, key: string, tenantId: string): Promise<StoredObject | null> {
    const entity = await this.repo.findOne({ where: { bucket, key, tenantId } });
    return entity ? ({ ...entity } as unknown as StoredObject) : null;
  }

  async findAll(tenantId: string): Promise<StoredObject[]> {
    const entities = await this.repo.find({ where: { tenantId } });
    return entities.map(e => ({ ...e } as unknown as StoredObject));
  }

  async updateStatus(id: string, tenantId: string, status: string): Promise<void> {
    await this.repo.update({ id, tenantId }, { status });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }
}

@Injectable()
export class StorageQuotaRepositoryImpl implements IStorageQuotaRepository {
  constructor(
    @InjectRepository(StorageQuotaOrmEntity)
    private readonly repo: Repository<StorageQuotaOrmEntity>,
  ) {}

  async findByTenant(tenantId: string): Promise<StorageQuota | null> {
    const entity = await this.repo.findOne({ where: { tenantId } });
    return entity ? ({ ...entity } as unknown as StorageQuota) : null;
  }

  async upsert(quota: StorageQuota): Promise<StorageQuota> {
    const existing = await this.findByTenant(quota.tenantId);
    if (existing) {
      await this.repo.update({ tenantId: quota.tenantId }, {
        maxBytes: quota.maxBytes,
        maxObjects: quota.maxObjects,
      });
      return { ...existing, maxBytes: quota.maxBytes, maxObjects: quota.maxObjects };
    }
    const entity = this.repo.create({
      tenantId: quota.tenantId,
      maxBytes: quota.maxBytes,
      usedBytes: 0,
      maxObjects: quota.maxObjects,
      usedObjects: 0,
    });
    const saved = await this.repo.save(entity);
    return { ...saved } as unknown as StorageQuota;
  }

  async incrementUsage(tenantId: string, bytes: number, objects: number): Promise<void> {
    await this.repo.createQueryBuilder()
      .update(StorageQuotaOrmEntity)
      .set({
        usedBytes: () => `used_bytes + ${bytes}`,
        usedObjects: () => `used_objects + ${objects}`,
      })
      .where('tenant_id = :tenantId', { tenantId })
      .execute();
  }

  async decrementUsage(tenantId: string, bytes: number, objects: number): Promise<void> {
    await this.repo.createQueryBuilder()
      .update(StorageQuotaOrmEntity)
      .set({
        usedBytes: () => `GREATEST(used_bytes - ${bytes}, 0)`,
        usedObjects: () => `GREATEST(used_objects - ${objects}, 0)`,
      })
      .where('tenant_id = :tenantId', { tenantId })
      .execute();
  }
}
