export enum OcrJobStatus { PENDING = 'pending', PROCESSING = 'processing', COMPLETED = 'completed', FAILED = 'failed' }

export interface OcrTable { rows: string[][]; headers?: string[]; confidence: number; }

export interface OcrLayoutBlock { type: 'paragraph' | 'heading' | 'table' | 'list' | 'image'; content: string; boundingBox?: { x: number; y: number; width: number; height: number }; confidence: number; }

export interface OcrJob {
  id: string;
  tenantId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  status: OcrJobStatus;
  language: string;
  extractedText?: string;
  tables?: OcrTable[];
  layoutAnalysis?: OcrLayoutBlock[];
  confidence?: number;
  aiRequestId?: string;
  processingTimeMs?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}
