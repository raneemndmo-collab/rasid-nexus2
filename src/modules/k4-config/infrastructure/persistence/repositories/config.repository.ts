import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigOrmEntity } from './config.orm-entity';
import { IConfigRepository, ConfigItem } from '../../../domain/interfaces/config-repository.interface';

@Injectable()
export class ConfigRepository implements IConfigRepository {
  constructor(
    @InjectRepository(ConfigOrmEntity)
    private readonly repo: Repository<ConfigOrmEntity>,
  ) {}

  async get(tenantId: string, key: string): Promise<ConfigItem | null> {
    return this.repo.findOne({ where: { tenantId, key } });
  }

  async getAll(tenantId: string): Promise<ConfigItem[]> {
    return this.repo.find({ where: { tenantId } });
  }

  async set(tenantId: string, key: string, value: unknown, description?: string, type?: string): Promise<ConfigItem> {
    const existing = await this.repo.findOne({ where: { tenantId, key } });
    if (existing) {
      existing.value = value;
      if (description !== undefined) existing.description = description;
      if (type !== undefined) existing.type = type;
      return this.repo.save(existing);
    }
    const entity = this.repo.create({ tenantId, key, value, description, type: type || 'string' });
    return this.repo.save(entity);
  }

  async delete(tenantId: string, key: string): Promise<void> {
    await this.repo.delete({ tenantId, key });
  }
}
