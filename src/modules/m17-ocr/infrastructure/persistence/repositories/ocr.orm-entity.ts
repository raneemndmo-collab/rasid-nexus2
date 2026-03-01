import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('ocr_jobs')
@Index('idx_ocr_tenant', ['tenantId'])
export class OcrJobEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'tenant_id', type: 'uuid' }) tenantId!: string;
  @Column({ name: 'file_name', type: 'varchar', length: 500 }) fileName!: string;
  @Column({ name: 'file_url', type: 'text' }) fileUrl!: string;
  @Column({ name: 'mime_type', type: 'varchar', length: 100 }) mimeType!: string;
  @Column({ type: 'varchar', length: 50, default: 'pending' }) status!: string;
  @Column({ type: 'varchar', length: 10, default: 'ar' }) language!: string;
  @Column({ name: 'extracted_text', type: 'text', nullable: true }) extractedText?: string;
  @Column({ type: 'jsonb', nullable: true }) tables?: Record<string, unknown>[];
  @Column({ name: 'layout_analysis', type: 'jsonb', nullable: true }) layoutAnalysis?: Record<string, unknown>[];
  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true }) confidence?: number;
  @Column({ name: 'ai_request_id', type: 'uuid', nullable: true }) aiRequestId?: string;
  @Column({ name: 'processing_time_ms', type: 'int', nullable: true }) processingTimeMs?: number;
  @Column({ type: 'text', nullable: true }) error?: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt!: Date;
  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true }) completedAt?: Date;
}
