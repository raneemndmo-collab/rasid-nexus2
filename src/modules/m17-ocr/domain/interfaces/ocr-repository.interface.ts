import { OcrJob } from '../entities/ocr.entity';

export interface IOcrRepository {
  create(job: Omit<OcrJob, 'id' | 'createdAt'>): Promise<OcrJob>;
  findById(tenantId: string, id: string): Promise<OcrJob | null>;
  list(tenantId: string): Promise<OcrJob[]>;
  update(tenantId: string, id: string, updates: Partial<OcrJob>): Promise<OcrJob>;
}

export const OCR_REPOSITORY = Symbol('IOcrRepository');
