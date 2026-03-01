import { Injectable, Inject } from '@nestjs/common';
import { CONFIG_REPOSITORY, IConfigRepository, ConfigItem } from '../../domain/interfaces/config-repository.interface';
import { EVENT_BUS, IEventBus } from '@shared/domain/interfaces/event-bus.interface';
import { v4 as uuidv4 } from 'uuid';

export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

@Injectable()
export class ConfigService {
  private readonly CACHE_PREFIX = 'config:';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @Inject(CONFIG_REPOSITORY) private readonly configRepo: IConfigRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async get(tenantId: string, key: string): Promise<ConfigItem | null> {
    const cacheKey = `${this.CACHE_PREFIX}${tenantId}:${key}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ConfigItem;
    }

    const item = await this.configRepo.get(tenantId, key);
    if (item) {
      await this.cache.set(cacheKey, JSON.stringify(item), this.CACHE_TTL);
    }
    return item;
  }

  async getAll(tenantId: string): Promise<ConfigItem[]> {
    return this.configRepo.getAll(tenantId);
  }

  async set(tenantId: string, key: string, value: unknown, description?: string, type?: string): Promise<ConfigItem> {
    const item = await this.configRepo.set(tenantId, key, value, description, type);

    // Invalidate cache
    const cacheKey = `${this.CACHE_PREFIX}${tenantId}:${key}`;
    await this.cache.del(cacheKey);

    // Publish config change event
    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'config.changed',
      tenant_id: tenantId,
      correlation_id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { key, value },
    });

    return item;
  }

  async delete(tenantId: string, key: string): Promise<void> {
    await this.configRepo.delete(tenantId, key);
    const cacheKey = `${this.CACHE_PREFIX}${tenantId}:${key}`;
    await this.cache.del(cacheKey);

    await this.eventBus.publish({
      event_id: uuidv4(),
      event_type: 'config.deleted',
      tenant_id: tenantId,
      correlation_id: uuidv4(),
      timestamp: new Date().toISOString(),
      version: 1,
      payload: { key },
    });
  }
}
