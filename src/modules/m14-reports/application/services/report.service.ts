import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReportDefinitionRepository, IReportExecutionRepository, IScheduledReportRepository } from '../../domain/interfaces/report-repository.interface';
import { ReportDefinition, ReportExecution, ReportStatus, ReportFormat, ScheduledReport } from '../../domain/entities/report.entity';
import { IEventBus, EVENT_BUS } from '../../../../shared/domain/interfaces/event-bus.interface';
import { REPORT_EVENTS } from '../../domain/events/report.events';
import * as crypto from 'crypto';

export interface CreateReportDefinitionDto {
  tenantId: string;
  name: string;
  description?: string;
  module: string;
  queryTemplate: string;
  parameters?: unknown[];
  columns?: unknown[];
  createdBy: string;
}

export interface ExecuteReportDto {
  tenantId: string;
  definitionId: string;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  executedBy: string;
}

export interface ScheduleReportDto {
  tenantId: string;
  definitionId: string;
  cronExpression: string;
  format: ReportFormat;
  parameters: Record<string, unknown>;
  recipients: string[];
  createdBy: string;
}

@Injectable()
export class ReportService {
  constructor(
    @Inject('IReportDefinitionRepository') private readonly defRepo: IReportDefinitionRepository,
    @Inject('IReportExecutionRepository') private readonly execRepo: IReportExecutionRepository,
    @Inject('IScheduledReportRepository') private readonly schedRepo: IScheduledReportRepository,
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
  ) {}

  async createDefinition(dto: CreateReportDefinitionDto): Promise<ReportDefinition> {
    const definition: ReportDefinition = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      name: dto.name,
      description: dto.description,
      module: dto.module,
      queryTemplate: dto.queryTemplate,
      parameters: (dto.parameters || []) as any,
      columns: (dto.columns || []) as any,
      isSystem: false,
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.defRepo.save(definition);
  }

  async getDefinition(id: string, tenantId: string): Promise<ReportDefinition> {
    const def = await this.defRepo.findById(id, tenantId);
    if (!def) throw new NotFoundException('Report definition not found');
    return def;
  }

  async listDefinitions(tenantId: string): Promise<ReportDefinition[]> {
    return this.defRepo.findAll(tenantId);
  }

  async listByModule(module: string, tenantId: string): Promise<ReportDefinition[]> {
    return this.defRepo.findByModule(module, tenantId);
  }

  async executeReport(dto: ExecuteReportDto): Promise<ReportExecution> {
    const definition = await this.defRepo.findById(dto.definitionId, dto.tenantId);
    if (!definition) throw new NotFoundException('Report definition not found');

    const execution: ReportExecution = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      definitionId: dto.definitionId,
      status: ReportStatus.GENERATING,
      format: dto.format,
      parameters: dto.parameters,
      executedBy: dto.executedBy,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    const saved = await this.execRepo.save(execution);

    // Simulate report generation (in production, this would be async)
    try {
      const resultFileId = crypto.randomUUID();
      const rowCount = Math.floor(Math.random() * 1000) + 1;

      const completed = await this.execRepo.update(saved.id, dto.tenantId, {
        status: ReportStatus.COMPLETED,
        resultFileId,
        rowCount,
        completedAt: new Date(),
      });

      await this.eventBus.publish({
        event_type: REPORT_EVENTS.REPORT_GENERATED,
        tenant_id: dto.tenantId,
        timestamp: new Date(),
        payload: { executionId: saved.id, definitionId: dto.definitionId, rowCount, format: dto.format },
      });

      return completed;
    } catch (error) {
      await this.execRepo.update(saved.id, dto.tenantId, {
        status: ReportStatus.FAILED,
        errorMessage: (error as Error).message,
        completedAt: new Date(),
      });

      await this.eventBus.publish({
        event_type: REPORT_EVENTS.REPORT_FAILED,
        tenant_id: dto.tenantId,
        timestamp: new Date(),
        payload: { executionId: saved.id, error: (error as Error).message },
      });

      throw error;
    }
  }

  async getExecution(id: string, tenantId: string): Promise<ReportExecution> {
    const exec = await this.execRepo.findById(id, tenantId);
    if (!exec) throw new NotFoundException('Report execution not found');
    return exec;
  }

  async listExecutions(tenantId: string): Promise<ReportExecution[]> {
    return this.execRepo.findAll(tenantId);
  }

  async scheduleReport(dto: ScheduleReportDto): Promise<ScheduledReport> {
    const schedule: ScheduledReport = {
      id: crypto.randomUUID(),
      tenantId: dto.tenantId,
      definitionId: dto.definitionId,
      cronExpression: dto.cronExpression,
      format: dto.format,
      parameters: dto.parameters,
      recipients: dto.recipients,
      enabled: true,
      createdBy: dto.createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.schedRepo.save(schedule);

    await this.eventBus.publish({
      event_type: REPORT_EVENTS.REPORT_SCHEDULED,
      tenant_id: dto.tenantId,
      timestamp: new Date(),
      payload: { scheduleId: saved.id, definitionId: dto.definitionId },
    });

    return saved;
  }

  async listSchedules(tenantId: string): Promise<ScheduledReport[]> {
    return this.schedRepo.findAll(tenantId);
  }

  async toggleSchedule(id: string, tenantId: string, enabled: boolean): Promise<ScheduledReport> {
    return this.schedRepo.update(id, tenantId, { enabled });
  }

  async deleteSchedule(id: string, tenantId: string): Promise<void> {
    await this.schedRepo.delete(id, tenantId);
  }
}
