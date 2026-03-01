import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IOcrRepository } from '../../../domain/interfaces/ocr-repository.interface';
import { OcrJob } from '../../../domain/entities/ocr.entity';
import { OcrJobEntity } from './ocr.orm-entity';

@Injectable()
export class OcrRepository implements IOcrRepository {
  constructor(@InjectRepository(OcrJobEntity) private readonly repo: Repository<OcrJobEntity>) {}

  async create(job: Omit<OcrJob, 'id' | 'createdAt'>): Promise<OcrJob> {
    const saved = await this.repo.save(this.repo.create(job as any));
    return saved as unknown as OcrJob;
  }
  async findById(tenantId: string, id: string): Promise<OcrJob | null> {
    return this.repo.findOne({ where: { tenantId, id } }) as unknown as OcrJob | null;
  }
  async list(tenantId: string): Promise<OcrJob[]> {
    return this.repo.find({ where: { tenantId } }) as unknown as OcrJob[];
  }
  async update(tenantId: string, id: string, updates: Partial<OcrJob>): Promise<OcrJob> {
    await this.repo.update({ tenantId, id }, updates as Record<string, unknown>);
    return this.findById(tenantId, id) as unknown as OcrJob;
  }
}
