import { Injectable, Inject } from '@nestjs/common';
import { IOcrRepository, OCR_REPOSITORY } from '../../domain/interfaces/ocr-repository.interface';
import { OcrJob, OcrJobStatus } from '../../domain/entities/ocr.entity';
import { OcrEvents } from '../../domain/events/ocr.events';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';

/**
 * M17 OCR Service — uses M11 IVisionAnalysis ONLY for AI capabilities.
 * SA-003: No direct AI model hosting. All AI goes through M11.
 */

export interface IVisionAnalysisPort {
  analyzeImage(tenantId: string, imageUrl: string, prompt: string): Promise<{ text: string; requestId: string }>;
}

export const VISION_ANALYSIS_PORT = Symbol('IVisionAnalysisPort');

@Injectable()
export class OcrService {
  constructor(
    @Inject(OCR_REPOSITORY) private readonly repo: IOcrRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    @Inject(VISION_ANALYSIS_PORT) private readonly vision: IVisionAnalysisPort,
  ) {}

  async createJob(data: { tenantId: string; fileName: string; fileUrl: string; mimeType: string; language?: string }): Promise<OcrJob> {
    const job = await this.repo.create({
      ...data,
      status: OcrJobStatus.PENDING,
      language: data.language || 'ar',
    });
    await this.eventBus.publish({ event_type: OcrEvents.JOB_CREATED, tenant_id: data.tenantId, timestamp: new Date(), payload: job });
    return job;
  }

  async processJob(tenantId: string, jobId: string): Promise<OcrJob> {
    await this.repo.update(tenantId, jobId, { status: OcrJobStatus.PROCESSING });
    await this.eventBus.publish({ event_type: OcrEvents.JOB_PROCESSING, tenant_id: tenantId, timestamp: new Date(), payload: { jobId } });

    const job = await this.repo.findById(tenantId, jobId);
    if (!job) throw new Error('OCR job not found');

    const startTime = Date.now();

    try {
      // Step 1: Extract text via M11 IVisionAnalysis
      const textResult = await this.vision.analyzeImage(
        tenantId,
        job.fileUrl,
        `Extract all text from this document image. Language: ${job.language}. Return the full extracted text.`
      );

      // Step 2: Extract tables via M11 IVisionAnalysis
      const tableResult = await this.vision.analyzeImage(
        tenantId,
        job.fileUrl,
        `Identify and extract all tables from this document image. Return as JSON array of tables, each with headers and rows.`
      );

      // Step 3: Layout analysis via M11 IVisionAnalysis
      const layoutResult = await this.vision.analyzeImage(
        tenantId,
        job.fileUrl,
        `Analyze the layout of this document. Identify paragraphs, headings, tables, lists, and images. Return as JSON array of blocks.`
      );

      const processingTimeMs = Date.now() - startTime;

      let tables;
      try { tables = JSON.parse(tableResult.text); } catch { tables = []; }
      let layout;
      try { layout = JSON.parse(layoutResult.text); } catch { layout = []; }

      const updated = await this.repo.update(tenantId, jobId, {
        status: OcrJobStatus.COMPLETED,
        extractedText: textResult.text,
        tables,
        layoutAnalysis: layout,
        confidence: 0.95,
        aiRequestId: textResult.requestId,
        processingTimeMs,
        completedAt: new Date(),
      });

      await this.eventBus.publish({ event_type: OcrEvents.JOB_COMPLETED, tenant_id: tenantId, timestamp: new Date(), payload: updated });
      if (tables && tables.length > 0) {
        await this.eventBus.publish({ event_type: OcrEvents.TABLE_EXTRACTED, tenant_id: tenantId, timestamp: new Date(), payload: { jobId, tableCount: tables.length } });
      }

      return updated;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const updated = await this.repo.update(tenantId, jobId, {
        status: OcrJobStatus.FAILED,
        error: errMsg,
        processingTimeMs: Date.now() - startTime,
        completedAt: new Date(),
      });
      await this.eventBus.publish({ event_type: OcrEvents.JOB_FAILED, tenant_id: tenantId, timestamp: new Date(), payload: { jobId, error: errMsg } });
      return updated;
    }
  }

  async getJob(tenantId: string, id: string) { return this.repo.findById(tenantId, id); }
  async listJobs(tenantId: string) { return this.repo.list(tenantId); }
}
