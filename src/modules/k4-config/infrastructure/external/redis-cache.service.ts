import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ICacheService } from '../../application/services/config.service';

@Injectable()
export class RedisCacheService implements ICacheService {
  private readonly client: Redis;

  constructor(private readonly nestConfig: NestConfigService) {
    this.client = new Redis({
      host: this.nestConfig.get<string>('REDIS_HOST', 'localhost'),
      port: this.nestConfig.get<number>('REDIS_PORT', 6379),
      password: this.nestConfig.get<string>('REDIS_PASSWORD'),
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
